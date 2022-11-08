<script lang="ts">
    import format from 'date-fns/format';
    import addDays from 'date-fns/addDays';
    import {derived} from "svelte/store";
    import {selectedDate} from "../stores";

    $: formattedDate = derived(selectedDate, () => format($selectedDate, 'EEEE dd.MM.yyyy'));

    function updateDate(e) {
        let diff = e.target.id === 'next' ? 1 : -1;
        selectedDate.update(date => addDays(date, diff));
    }

    function handleKeyDown(e) {
        if (e.key === 'ArrowLeft') {
            updateDate({target: {id: 'prev'}});
        } else if (e.key === 'ArrowRight') {
            updateDate({target: {id: 'next'}});
        }
    }

</script>

<div>
    <a on:click|preventDefault={updateDate} href id="previous" class="round">&#8249;</a>
    <p>{$formattedDate}</p>
    <a on:click|preventDefault={updateDate} href id="next" class="round">&#8250;</a>
</div>

<svelte:window on:keydown={handleKeyDown}/>

<style>
    div {
        text-align: center;
        width: 50vw;
    }

    p {
        margin-top: 0.6vmax;
        font-size: calc(1vw + 10px);
        display: inline-block;
    }

    a {
        text-decoration: none;
        font-size: 2vw;
        display: inline-block;
        padding: 0.8vw 2vw;
    }

    a:hover {
        background-color: #ddd;
        color: black;
    }

    #previous {
        float: left;
        background-color: #f1f1f1;
        color: black;
    }

    #next {
        float: right;
        background-color: #04AA6D;
        color: white;
    }

    .round {
        border-radius: 50%;
    }
</style>