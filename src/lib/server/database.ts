import {connect, model, Schema} from 'mongoose';
import type {Appointment} from "../model/Appointment";
import {error} from "@sveltejs/kit";

export interface IAppointment {
    machine: string;
    timeSlot: number;
    date: Date;
    user: { name: string, room: string };
}

const appointmentSchema = new Schema<IAppointment>({
    machine: { type: String, required: true },
    user: { type:{room: String, name: String} , required: true },
    timeSlot: {type: Number, required: true},
    date: { type: Date, required: true }
});
const AppointmentModel = model<IAppointment>('Appointment', appointmentSchema);
const dbUri = 'mongodb://localhost:27017/washing_book';

/**
 * Get all appointments for a given date
 */
export async function findByDate(date: Date): Promise<IAppointment[]>{
    await connect(dbUri);
    return AppointmentModel.find({date: date});
}

/**
 * Create an appointment in the database
 * @param appointment appointment should contain machine, timeSlot, date and user
 */
export async function insert(appointment: Appointment){
    if (appointment.user === null){
        throw error(400, "User cannot be null");
    }
    await connect(dbUri);
    const dbAppointment = new AppointmentModel({
        machine: appointment.machine.name,
        user: {room: appointment.user.room, name: appointment.user.name},
        timeSlot: appointment.timeSlot.id,
        date: new Date(new Date(appointment.date).setUTCHours(0,0,0,0))
    })
    return dbAppointment.save();
    // TODO Error handling and return
}

export async function findByDateSlotAndMachine(date: Date, timeSlot: number, machine: string): Promise<IAppointment | null>{
    console.log("findByDateSlotAndMachine", date, timeSlot, machine);
    await connect(dbUri);
    return AppointmentModel.findOne({date: date, timeSlot: timeSlot, machine: machine});
}

export async function deleteAppointment(appointment: Appointment){
    if (appointment.user === null){
        throw error(400, "User cannot be null");
    }
    await connect(dbUri);
    const filter = {
        machine: appointment.machine.name,
        "user.name": appointment.user.name,
        timeSlot: appointment.timeSlot.id,
        date: new Date(new Date(appointment.date).setUTCHours(0,0,0,0))
    };
    return AppointmentModel.deleteOne(filter);
}
