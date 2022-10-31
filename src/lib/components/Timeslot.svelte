<script lang="ts">
    import isBefore from "date-fns/isBefore";
    import isAfter from "date-fns/isAfter";
    import addHours from "date-fns/addHours";
    import parse from "date-fns/parse";
    import {derived, type Readable} from "svelte/store";
    import type {Appointment} from "../model/Appointment";
    import {onMount} from "svelte";
    import type User from "../model/User";
    import {userStore} from "../stores";
    import {createAppointment, deleteAppointment} from "../api";
    import type Machine from "../model/Machine";
    import type TimeSlot from "../model/TimeSlot";
    import {appointmentsStore, getAppointment} from "../stores";

    let appointment: Readable<Appointment>;
    export let machine: Machine;
    export let timeSlot: TimeSlot;
    let blockedBy: Readable<User | null>;

    onMount(() => appointment = getAppointment(machine, timeSlot))

    function timeSlotActive(): boolean {
        let start = parse($appointment.timeSlot.start, "HH:mm", new Date());
        let end = parse($appointment.timeSlot.end, "HH:mm", new Date());
        // Include 1 hour dryer time
        end = addHours(end , 1)
        return isAfter(new Date(), start) && isBefore(new Date(), end);
    }

    function timeSlotClicked() {
        if ($blockedBy != null) {
            if ($blockedBy.equals($userStore)) {
                deleteAppointment($appointment)
                    .then(() => {
                        appointmentsStore.update(appointments => appointments.filter(o => !o.equals($appointment)));
                        $appointmentsStore = $appointmentsStore
                    });
            } else { return; }
        } else {
            const a = $appointment;
            a.user = $userStore;
            // TODO: Handle error
            createAppointment($appointment).then((createdAppointment) => {
                $appointmentsStore.push(createdAppointment);
                $appointmentsStore = $appointmentsStore;
            });
        }
    }

    onMount(() => {
        blockedBy = derived(appointment, $appointment => $appointment.user);
    });
</script>

<div class="{$blockedBy ? 'blocked':'free'}" on:click={timeSlotClicked}>
    <span>
        <strong>
            {#if $blockedBy != null}
                {#if $blockedBy.room !== ""}
                    <p>Blocked by {$blockedBy.room}</p>
                {:else}
                    <p>Blocked</p>
                {/if}
            {:else if $blockedBy == null && $appointment}
                Free
            {:else}
                Loading...
            {/if}
        </strong>
    </span>
</div>

<!-- css -->
<style>
    .blocked {
        background-color: #ff0000;
    }

    .free {
        background-color: #00ff00;
    }

    /* div fills up parent td*/
    div {
        position: relative;
        height: 6.5vh;
        width: 33vw;
    }

    /* center span in parent div */
    span {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
</style>