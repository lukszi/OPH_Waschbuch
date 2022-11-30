import type {ClientConfig, QueryResult} from 'pg';
import {Client} from 'pg';
import type {Appointment} from "../model/Appointment";
import {error} from "@sveltejs/kit";
import type User from "../model/User";
import type Machine from "../model/Machine";
import fs from 'fs';
import type {IAppointment} from "./database";

const config: ClientConfig = JSON.parse(fs.readFileSync('src/lib/server/db.json', 'utf8'));
const client = new Client(config)
await client.connect()

/**
 * Get all appointments for a given date
 */
export async function findByDate(date: Date): Promise<IAppointment[]> {
    const normalizedDate = normalizeDate(date);
    const result = await client.query('SELECT a.date as date, a.slot_id as timeSlot, u.room as room, u.name as name, w.name as washer ' +
        'FROM appointment as a left outer join washer w on a.washer_id = w.id left outer join users u on a.user_id = u.id ' +
        'WHERE a.date = $1 AND a.deleted = false', [normalizedDate]);
    return createAppointmentObjsFromQuery(result);
}

/**
 * Fetches a users id or creates a new user and returns its id
 * @param user user to fetch or create
 */
async function getOrCreateUserId(user: User): Promise<number> {
    let userQuery: QueryResult = await client.query('select id from users where name = $1 and room = $2',
        [user.name, user.room]);

    // There shouldn't be more than one user with the same name and room
    if (userQuery.rowCount > 1) {
        throw error(500, "Multiple users with same room and name found");
    }
    // If no user was found create a new one
    else if (userQuery.rowCount === 0) {
        userQuery = await client.query('insert into users (name, room) values ($1, $2) RETURNING ID',
            [user.name, user.room]);
    }
    return userQuery.rows[0].id;
}

async function getWasherId(machine: Machine): Promise<number> {
    const washerQuery: QueryResult = await client.query('select id from washer where name = $1', [machine.name]);
    return washerQuery.rows[0].id;
}

/**
 * Create an appointment in the database
 * @param appointment appointment should contain machine, timeSlot, date and user
 */
export async function insert(appointment: Appointment): Promise<IAppointment> {
    if (appointment.user === null) {
        throw error(400, "User cannot be null");
    }
    // Get dependencies
    const userId = await getOrCreateUserId(appointment.user);
    const washerId = await getWasherId(appointment.machine);
    const normalizedDate = normalizeDate(appointment.date);

    // Insert
    const insertResult: QueryResult = await client.query('INSERT INTO appointment (washer_id, user_id, slot_id, date) VALUES ($1, $2, $3, $4) RETURNING ID',
        [washerId, userId, appointment.timeSlot.id, normalizedDate]);

    // Get created Appointment
    const appointmentId = insertResult.rows[0].id;
    const queryResult = await client.query(
        'SELECT a.date as date, a.slot_id as timeSlot, u.room as room, u.name as name, w.name as washer ' +
        'FROM appointment as a left outer join washer w on a.washer_id = w.id left outer join users u on a.user_id = u.id ' +
        'WHERE a.id = $1 AND a.deleted = false',
        [appointmentId]);

    // Return created appointment
    return createAppointmentObjsFromQuery(queryResult)[0];
}

function createAppointmentObjsFromQuery(queryResult: QueryResult): IAppointment[] {
    return queryResult.rows.map(row => {
        return {
            date: normalizeDate(row.date),
            timeSlot: row.timeslot,
            user: {
                name: row.name,
                room: row.room
            },
            machine: row.washer
        }
    });
}

/**
 * Find a single appointment in the database determined by its date, timeSlot and machine
 *
 * @param date
 * @param timeSlot
 * @param machine
 *
 * @return {Appointment} the appointment or null if no appointment was found
 */
export async function findByDateSlotAndMachine(date: Date, timeSlot: number, machine: string): Promise<IAppointment | null> {
    const normalizedDate = normalizeDate(date);
    const result = await client.query(
        'SELECT a.date as date, a.slot_id as timeSlot, u.room as room, u.name as name, w.name as washer ' +
        'FROM appointment as a left outer join washer w on a.washer_id = w.id left outer join users u on a.user_id = u.id ' +
        'WHERE a.date = $1 AND a.slot_id = $2 AND w.name = $3 AND a.deleted = false',
        [normalizedDate, timeSlot, machine]);
    if (result.rowCount === 0) {
        return null;
    }
    return createAppointmentObjsFromQuery(result)[0];
}

export async function deleteAppointment(appointment: Appointment) {
    if (appointment.user === null) {
        throw error(400, "User cannot be null");
    }
    await client.query('UPDATE appointment SET deleted=true WHERE date = $3 AND id in (SELECT a.id FROM appointment as a left outer join washer w on a.washer_id = w.id left outer join users u on a.user_id=u.id WHERE slot_id = $2 AND w.name = $1 AND u.name = $4 AND a.deleted = false)',
        [appointment.machine.name, appointment.timeSlot.id, normalizeDate(appointment.date), appointment.user.name]);
    return;
}

/**
 * Count all appointments for a given room and date
 *
 * @param room room number
 * @param date date without time
 *
 * @return number of appointments for the given room and date
 */
export async function countAppointmentsByRoomAndDate(room: string, date: Date): Promise<number> {
    const normalizedDate = normalizeDate(date);
    const result = await client.query('SELECT count(*) ' +
        'FROM appointment as a left outer join users u on a.user_id = u.id ' +
        'WHERE u.room = $1 AND date = $2 AND a.deleted = false',
        [room, normalizedDate]);
    return result.rows[0].count;
}

/**
 * Makes a copy of the given date and removes the time
 *
 * @param date date to normalize
 *
 * @return copy of date without time
 */
function normalizeDate(date: Date): Date {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
}