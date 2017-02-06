"""
This migration script adds a user preferences table to Galaxy.
"""
from __future__ import print_function

import datetime
import logging

from sqlalchemy import Column, ForeignKey, Integer, MetaData, Table, Unicode

now = datetime.datetime.utcnow
log = logging.getLogger( __name__ )
metadata = MetaData()

# New table to support user preferences.
UserPreference_table = Table( "user_preference", metadata,
                              Column( "id", Integer, primary_key=True ),
                              Column( "user_id", Integer, ForeignKey( "galaxy_user.id" ), index=True ),
                              Column( "name", Unicode( 255 ), index=True),
                              Column( "value", Unicode( 1024 ) ) )


def upgrade(migrate_engine):
    metadata.bind = migrate_engine
    print(__doc__)
    metadata.reflect()
    try:
        UserPreference_table.create()
    except Exception as e:
        print(str(e))
        log.debug( "Creating user_preference table failed: %s" % str( e ) )


def downgrade(migrate_engine):
    metadata.bind = migrate_engine
    metadata.reflect()
    try:
        UserPreference_table.drop()
    except Exception as e:
        print(str(e))
        log.debug( "Dropping user_preference table failed: %s" % str( e ) )
