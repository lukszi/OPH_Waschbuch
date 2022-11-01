<script lang="ts">
    import {derived, type Readable} from "svelte/store";
    import type {Appointment} from "../model/Appointment";
    import {onMount} from "svelte";
    import type User from "../model/User";
    import {selectedDate, userStore} from "../stores";
    import {createAppointment, deleteAppointment, getAppointments} from "../network/api";
    import type Machine from "../model/Machine";
    import type TimeSlot from "../model/TimeSlot";
    import {appointmentsStore, getAppointment} from "../stores";

    let appointment: Readable<Appointment>;
    export let machine: Machine;
    export let timeSlot: TimeSlot;
    let blockedBy: Readable<User | null>;


    async function deleteReservation() {
        if (!$blockedBy.equals($userStore)) {
            // User does not own appointment
            return;
        }
        if(!await deleteAppointment($appointment)){
            // TODO: Handle delete rejection properly
            // Appointment not deleted
            return;
        }
        appointmentsStore.set(await getAppointments($selectedDate));
    }

    async function createReservation() {
        const a = $appointment;
        a.user = $userStore;
        try
        {
            await createAppointment($appointment);
        }
        catch (e) {
            // TODO: Handle error properly
            console.log(e);
        }
        appointmentsStore.set(await getAppointments($selectedDate));
    }

    function timeSlotClicked() {
        $blockedBy == null ? createReservation() : deleteReservation();
    }

    onMount(() => {
        appointment = getAppointment(machine, timeSlot)
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