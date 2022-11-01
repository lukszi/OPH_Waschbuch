/**
 * Network helper functions
 */

import {AuthenticationError} from "../errors";
import type {Authentication} from "../model/Authentication";
import {get} from "svelte/types/runtime/store";
import {authStore} from "../stores";
import {Appointment} from "../model/Appointment";
import TimeSlot from "../model/TimeSlot";
import Machine from "../model/Machine";
import User from "../model/User";

/**
 * Fetch authentication from store
 *
 * @throws AuthenticationError if authentication is not yet set
 * @return {Authentication} Authentication object from store
 */
export function getAuth(): Authentication {
    const authentication: Authentication = get(authStore)
    if (authentication === null) {
        throw new AuthenticationError("User not logged in, authStore is empty.");
    }
    return authentication;
}

/**
 * Build request header with authentication token
 */
export function buildRequestHeader(): { "Content-Type": string, "Authorization": string } {
    const auth: Authentication = getAuth();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
    }
}

export function createAppointmentFromRawAppointment(rawAppointment: Record<string, unknown>): Appointment {
    return new Appointment(
        <Date>rawAppointment.date,
        new TimeSlot(<number>rawAppointment.timeSlot),
        new Machine(<string>rawAppointment.machine),
        new User((<User>rawAppointment.user).name, (<User>rawAppointment.user).room));
}