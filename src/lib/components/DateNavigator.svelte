<script lang="ts">
    import format from 'date-fns/format';
    import addDays from 'date-fns/addDays';
    import {derived} from "svelte/store";
    import {selectedDate} from "../stores";
    import DateNavigationListener from "$lib/components/DateNavigationListener.svelte";

    $: formattedDate = derived(selectedDate, () => format($selectedDate, 'EEEE dd.MM.yyyy'));

    function updateDate(e) {
        let diff = e.target.id === 'next' ? 1 : -1;
        selectedDate.update(date => addDays(date, diff));
    }
</script>

<div class="nav-bar-wrapper">
    <div class="button-wrapper">
        <a on:click|preventDefault={updateDate} href id="previous" class="button">&#8249;</a>
    </div>
    <div class="date-wrapper">
        <p class="date-text">{$formattedDate}</p>
    </div>
    <div class="button-wrapper">
        <a on:click|preventDefault={updateDate} href id="next" class="button">&#8250;</a>
    </div>
</div>
<DateNavigationListener/>

<style>
    .nav-bar-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        width: 50%;
        height: 8vh;
    }

    .date-wrapper {
        display: flex;
        justify-content: center;
        text-align: center;
        align-items: center;
        width: 100%;
    }

    .date-text {
        font-size: 2.5vmax;
        font-weight: 500;
    }

    .button-wrapper {
        display: inline-block;
        height: 100%;
        width: 50px;
        text-align: center;
    }

    .button {
        display: inline-block;
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        width: 4vmax;
        height: 4vmax;
        border-radius: 50%;
        background-color: #f2f2f2;
        text-decoration: none;
        color: #000;
        font-size: 2.5vmax;
        font-weight: bold;
    }

    .button:hover {
        background-color: #e6e6e6;
    }

</style>