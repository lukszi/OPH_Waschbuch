<script lang="ts">
    import {machines} from "../constants";
    import Timeslot from "./Timeslot.svelte";
    import TimeSlot from "../model/TimeSlot";

    const timeSlots: TimeSlot[] = [...Array(12).keys()].map(i => new TimeSlot(i))
</script>

<table>
    <thead>
    <tr>
        <th>TimeSlot</th>
        {#each machines as machine}
            <th>{machine.name}</th>
        {/each}
    </tr>
    </thead>
    {#each timeSlots as slot}
        <tr>
            <td>{slot.toString()}</td>
            {#each machines as machine}
                <td>
                    <Timeslot machine={machine} timeSlot={slot}/>
                </td>
            {/each}
        </tr>
    {/each}
</table>

<style>
    table {
        border-collapse: collapse;
    }

    th, td {
        text-align: center;
        border: 1px solid black;
    }
</style>