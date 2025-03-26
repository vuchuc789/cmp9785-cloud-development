'use client';

import {
  AudioSearchItem,
  mediaDetailMediaDetailGet,
  MediaLicense,
} from '@/client';
import { LicenseDetails } from '@/components/license-details';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAuthRequired } from '@/hooks/auth';
import { isBrowser, stringToColor } from '@/lib/utils';
import {
  ArrowLeft,
  ExternalLink,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function AudioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [audioDetails, setAudioDetails] = useState<AudioSearchItem>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement>(null);

  const router = useRouter();

  const isAuthLoading = useAuthRequired();

  useEffect(() => {
    const asyncFunc = async () => {
      if (isAuthLoading) {
        return;
      }

      const result = await mediaDetailMediaDetailGet({
        query: {
          type: 'audio',
          id,
        },
      });

      if (!result.data) {
        toast.error('Failed to fetch media details');
        return;
      }

      setAudioDetails(result.data as AudioSearchItem);
    };
    asyncFunc();
  }, [isAuthLoading, id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const setAudioEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Events
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', setAudioEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', setAudioEnded);
    };
  }, [audioDetails]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = value[0];
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 1;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grow max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/search">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 px-2 h-8 cursor-pointer"
            onClick={() => {
              if (isBrowser() && window.history.length > 1) {
                router.back();
              } else {
                router.replace('/search');
              }
            }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to results
          </Button>
        </Link>
      </div>

      {!!audioDetails && (
        <>
          {/* Full width audio player */}
          <div
            className={`rounded-lg overflow-hidden p-6 mb-8`}
            style={{
              backgroundColor: stringToColor(
                audioDetails?.title ?? 'An audio file'
              ),
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex-1 flex items-center justify-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
                  {audioDetails?.title ?? ''}
                </h1>
              </div>

              {/* Audio Player */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                {!!audioDetails?.url && (
                  <audio
                    ref={audioRef}
                    src={audioDetails.url}
                    preload="metadata"
                  />
                )}

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full bg-white text-gray-900 hover:bg-white/90 hover:text-gray-900 cursor-pointer"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6" />
                    )}
                  </Button>

                  <div className="flex-1 space-y-2">
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={handleTimeChange}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-white">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                      ) : (
                        <Volume2 className="h-5 w-5" />
                      )}
                    </Button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title, creator and source with View Original button on the right */}
          <div className="mb-8 flex justify-between items-start">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl font-bold truncate">
                {audioDetails?.title ?? ''}
              </h1>
              <p className="text-muted-foreground mt-1">
                by{' '}
                <Link
                  href={audioDetails?.creator_url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {audioDetails?.creator ?? ''}
                </Link>{' '}
                via{' '}
                <Link
                  href={audioDetails?.foreign_landing_url ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {audioDetails?.source ?? ''}
                </Link>
              </p>
            </div>

            <Link
              href={audioDetails?.foreign_landing_url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="flex items-center gap-2 cursor-pointer flex-1">
                <ExternalLink className="h-4 w-4" />
                View Original
              </Button>
            </Link>
          </div>

          {/* License details */}
          <LicenseDetails
            licenseType={(audioDetails?.license ?? '') as MediaLicense}
            mediaType="audio"
          />
        </>
      )}
    </div>
  );
}
