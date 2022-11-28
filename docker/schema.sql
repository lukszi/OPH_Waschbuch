CREATE DATABASE washbook;
CREATE USER wbAdmin WITH PASSWORD 'washPw';
GRANT ALL ON DATABASE washbook TO wbAdmin;
\connect washbook;

CREATE TABLE Users (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name varchar(255) NOT NULL,
    room varchar(255) NOT NULL
);

CREATE TABLE Washer (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Slot (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    start_time time NOT NULL,
    end_time time NOT NULL
);

CREATE TABLE Appointment (
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id integer NOT NULL,
    washer_id integer NOT NULL,
    slot_id integer NOT NULL,
    date DATE NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (washer_id) REFERENCES Washer(id),
    FOREIGN KEY (slot_id) REFERENCES Slot(id)
);

GRANT ALL ON SCHEMA public TO wbAdmin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO wbAdmin;