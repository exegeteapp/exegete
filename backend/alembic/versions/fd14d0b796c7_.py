"""empty message

Revision ID: fd14d0b796c7
Revises: ed0fc129fac8
Create Date: 2022-01-02 16:50:29.548962

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fd14d0b796c7'
down_revision = 'ed0fc129fac8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint(None, 'workspace', ['id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'workspace', type_='unique')
    # ### end Alembic commands ###
