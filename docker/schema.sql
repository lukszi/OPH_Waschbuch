CREATE DATABASE washbook;
\connect washbook;

-- Create Tables --
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

-- Create washbook user --
CREATE USER wbAdmin WITH PASSWORD 'washPw';
GRANT ALL ON DATABASE washbook TO wbAdmin;
GRANT ALL ON SCHEMA public TO wbAdmin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO wbAdmin;

-- Initialize washers --
INSERT INTO Washer (name) VALUES ('Machine 1'), ('Machine 2');
-- Initialize slots --
INSERT INTO Slot (start_time, end_time) VALUES
                                            ('00:00:00', '02:00:00'), ('02:00:00', '04:00:00'), ('04:00:00', '06:00:00'),
                                            ('06:00:00', '08:00:00'), ('08:00:00', '10:00:00'), ('10:00:00', '12:00:00'),
                                            ('12:00:00', '14:00:00'), ('14:00:00', '16:00:00'), ('16:00:00', '18:00:00'),
                                            ('18:00:00', '20:00:00'), ('20:00:00', '22:00:00'), ('22:00:00', '00:00:00');
