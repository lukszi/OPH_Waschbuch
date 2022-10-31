<script lang="ts">
    import DayView from "../lib/components/DayView.svelte";
    import DateNavigator from "../lib/components/DateNavigator.svelte";
    import Keycloak from "keycloak-js";
    import { onMount } from "svelte";

    const kcConf = {
        clientId: "Waschmarken",
        realm: "oph",
        "auth-server-url": "http://localhost:8080/",
        "ssl-required": "external",
        resource: "Waschmarken",
        "public-client": true,
        "confidential-port": 0,
        onLoad: "login-required",
        messageReceiveTimeout: 1000,
    };
    const oldKcConf = {
        realm: "oph",
        "auth-server-url": "http://localhost:8080/",
        clientId: "Waschmarken",
        checkLoginIframe: false,
    };

    function initKeycloak() {
        const keycloak = new Keycloak(kcConf);
        keycloak
            .init({
                onLoad: "login-required",
                checkLoginIframe: false,
            })
            .then(function (authenticated) {
                alert(authenticated ? "authenticated" : "not authenticated");
            })
            .catch((reason) => {
                console.log(reason);
            });
    }
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
