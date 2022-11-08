<script lang="ts">
    import {selectedDate} from "../stores";
    import addDays from "date-fns/addDays";

    /**
     * Change date on left and right arrow presses
     */
    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'ArrowLeft') {
            selectPreviousDay();
        } else if (e.key === 'ArrowRight') {
            selectNextDay();
        }
    }

    // Touch event coordinates
    let touchstart = [0, 0];
    let touchend = [0, 0];

    // Maximum angle between the swipe and the horizontal axis
    export const angleTolerance = 30;
    // Minimum length of swipe relative to screen-size
    export const swipeMinLength = 20;

    function handleTouchStart(e: TouchEvent) {
        const touch = e.changedTouches[0];
        touchstart = [touch.clientX, touch.clientY];
    }

    function handleTouchEnd(e: TouchEvent) {
        const touch = e.changedTouches[0];
        touchend = [touch.clientX, touch.clientY]
        processSwipe()
    }

    /**
     * Calculates angle and length of finished swipe.
     * Then checks if valid swipe was registered and selects next or previous day accordingly
     */
    function processSwipe() {
        // Create vector from start to end
        const v = [touchend[0] - touchstart[0], touchend[1] - touchstart[1]];
        // Calculate angle, vector relative to screen-size and length of vector
        const angle = Math.atan2(v[1], v[0]) * 180 / Math.PI;
        const vRel = [v[0] / window.innerWidth * 100, v[1] / window.innerHeight * 100];
        const vRelLength = Math.sqrt(Math.pow(vRel[0], 2) + Math.pow(vRel[1],2));

        // Check if swipe is long enough
        if (vRelLength < swipeMinLength) {
            return;
        }
        // Check whether swipe was left or right
        if (Math.abs(angle) < angleTolerance)
        {
            selectPreviousDay();
        }
        else if (Math.abs(angle) > 180 - angleTolerance)
        {
            selectNextDay();
        }
    }

    function selectPreviousDay() {
        selectedDate.update(d => addDays(d, -1));
    }

    function selectNextDay() {
        selectedDate.update(d => addDays(d, 1));
    }

</script>

<svelte:window on:keydown={handleKeyDown} on:touchend={handleTouchEnd} on:touchstart={handleTouchStart}/>