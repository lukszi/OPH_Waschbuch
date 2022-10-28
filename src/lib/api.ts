import {Appointment} from "./model/Appointment";
import User from "./model/User";
import TimeSlot from "./model/TimeSlot";
import Machine from "./model/Machine";

export async function getAppointments(date: Date): Promise<Appointment[]> {
    const appointments: Appointment[] = [];
    const rawAppointments = await (await fetch(`http://localhost:5173/api/appointments?date=${date.toISOString()}`)).json();
    let rawAppointment: object;
    for(rawAppointment of rawAppointments) {
        const appointment = createAppointmentFromRawAppointment(rawAppointment);
        appointments.push(appointment);
    }
    return appointments
}

export async function createAppointment(appointment: Appointment): Promise<Appointment>{
    const response: Response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointment)
    })
    return createAppointmentFromRawAppointment(await response.json());
}

export async function deleteAppointment(appointment: Appointment): Promise<boolean> {
    const response = await fetch('/api/appointments', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(appointment)
    });

    return response.ok;
}

function createAppointmentFromRawAppointment(rawAppointment: any) {
    return new Appointment(
        rawAppointment.date,
        new TimeSlot(rawAppointment.timeSlot),
        new Machine(rawAppointment.machine),
        new User(rawAppointment.user.name, rawAppointment.user.room));
}