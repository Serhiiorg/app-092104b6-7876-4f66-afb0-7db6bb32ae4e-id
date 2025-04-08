
        CREATE TABLE users
        (
          ID UUID DEFAULT UUID_GENERATE_V4()::UUID NOT NULL,
          value jsonb NOT NULL,
          PRIMARY KEY(ID)
        );
    

        CREATE TABLE meditation_sessions
        (
          ID UUID DEFAULT UUID_GENERATE_V4()::UUID NOT NULL,
          value jsonb NOT NULL,
          PRIMARY KEY(ID)
        );
    

        CREATE TABLE schedules
        (
          ID UUID DEFAULT UUID_GENERATE_V4()::UUID NOT NULL,
          value jsonb NOT NULL,
          PRIMARY KEY(ID)
        );
    

        CREATE TABLE favorite_videos
        (
          ID UUID DEFAULT UUID_GENERATE_V4()::UUID NOT NULL,
          value jsonb NOT NULL,
          PRIMARY KEY(ID)
        );
    

        CREATE TABLE user_progress
        (
          ID UUID DEFAULT UUID_GENERATE_V4()::UUID NOT NULL,
          value jsonb NOT NULL,
          PRIMARY KEY(ID)
        );
    