<script lang="ts">
    import DayView from "../lib/components/DayView.svelte";
    import DateNavigator from "../lib/components/DateNavigator.svelte";
</script>

<div id="dateNav">
    <DateNavigator/>
</div>
<div>
    <DayView/>
</div>

<style>
    #dateNav {
        display: flex;
        justify-content: center;
    }
</style>