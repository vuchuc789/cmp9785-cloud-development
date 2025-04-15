import socket
import threading
import time
from collections.abc import Callable

from confluent_kafka import Consumer, KafkaError, KafkaException, Producer

from app.core.config import get_settings
from app.core.logging import logger

settings = get_settings()
bootstrap_servers = ','.join(settings.kafka_servers)

producer_conf = {
    'bootstrap.servers': bootstrap_servers,
    'client.id': socket.gethostname(),
}
consumer_conf = {
    'bootstrap.servers': bootstrap_servers,
    'group.id': settings.server_mode.value,
    'enable.auto.commit': 'false',
    'auto.offset.reset': 'earliest',
}

producer = Producer(producer_conf)


def get_producer():
    return producer


def get_consume_thread(topics: list[str], process_message: Callable[[str], None]):
    consumer = Consumer(consumer_conf)
    stop_event = threading.Event()

    def consume_loop():
        try:
            consumer.subscribe(topics)
            logger.info(f'Subscribed to topic: {topics}')

            while not stop_event.is_set():
                # Poll for messages with a timeout (e.g., 1 second)
                # Timeout is crucial to allow checking the shutdown_event
                msg = consumer.poll(timeout=1.0)

                if msg is None:
                    # No message received within timeout, continue loop
                    continue

                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        # End of partition event, not an error
                        logger.debug(
                            f'%% {msg.topic()} [{msg.partition()}] reached end at offset {msg.offset()}'  # noqa: E501
                        )
                    elif msg.error():
                        # Actual error
                        logger.error(f'Kafka error: {msg.error()}')
                else:
                    # Proper message received
                    try:
                        message_value = msg.value().decode('utf-8')
                        logger.info(
                            f'Received message: Topic={msg.topic()}, Partition={msg.partition()}, Offset={msg.offset()}, Key={msg.key()}, Value={message_value}'  # noqa: E501
                        )
                        process_message(message_value)
                    except Exception as e:
                        logger.error(f'Error processing message: {e}')

                    # Manual commits:
                    try:
                        consumer.commit(asynchronous=False)
                    except KafkaException as e:
                        logger.error(f'Failed to commit offset: {e}')

                # Short sleep to prevent high CPU usage if poll returns immediately (e.g., error)
                time.sleep(0.01)

        except KafkaException as e:
            logger.error(f'Kafka subscription/polling error: {e}')
        except Exception as e:
            logger.error(f'Unexpected error in consumer loop: {e}', exc_info=True)
        finally:
            # Leave consumer group and clean up resources
            logger.info('Closing Kafka consumer...')
            consumer.close()
            logger.info('Kafka consumer closed.')

    consume_thread = threading.Thread(target=consume_loop, daemon=True)

    def start_consuming():
        consume_thread.start()

    def stop_consuming():
        stop_event.set()

        if consume_thread.is_alive():
            logger.info('Waiting for Kafka consumer thread to finish...')
            # Wait for the thread to terminate. This ensures consumer.close() is called.
            consume_thread.join(timeout=10.0)  # Add a timeout for safety
            if consume_thread.is_alive():
                logger.warning('Kafka consumer thread did not finish within timeout.')
            else:
                logger.info('Kafka consumer thread finished gracefully.')
        else:
            logger.info('Kafka consumer thread was not running or already finished.')

    return start_consuming, stop_consuming
