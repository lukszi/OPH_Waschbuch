<script lang="ts">
    import "../app.css";
    import DayView from "../lib/components/DayView.svelte";
    import DateNavigator from "../lib/components/DateNavigator.svelte";
    import { onMount } from "svelte";
    import {initKeycloak} from "../lib/keycloak";

    onMount(async () => {
        initKeycloak();
	});

</script>

<div id="dateNav">
    <DateNavigator />
</div>
<div>
    <DayView />
</div>

<style>
    #dateNav {
        display: flex;
        justify-content: center;
    }
</style>
