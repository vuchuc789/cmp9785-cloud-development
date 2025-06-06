"""Add file tables

Revision ID: 5fcd0d373aa0
Revises: cacebe6b0b8a
Create Date: 2025-04-13 22:12:16.159728

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '5fcd0d373aa0'
down_revision: str | None = 'cacebe6b0b8a'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    sa.Enum(
        'pending', 'processing', 'success', 'failed', 'unknown', name='fileprocessingstatus'
    ).create(op.get_bind())
    op.create_table(
        'files',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column(
            'status',
            postgresql.ENUM(
                'pending',
                'processing',
                'success',
                'failed',
                'unknown',
                name='fileprocessingstatus',
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'file_descriptions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('file_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ['file_id'],
            ['files.id'],
        ),
        sa.PrimaryKeyConstraint('id'),
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('file_descriptions')
    op.drop_table('files')
    sa.Enum(
        'pending', 'processing', 'success', 'failed', 'unknown', name='fileprocessingstatus'
    ).drop(op.get_bind())
    # ### end Alembic commands ###
