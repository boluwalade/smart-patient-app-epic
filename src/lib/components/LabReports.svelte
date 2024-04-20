<script lang="ts">

    import {BASE_URL} from '../../stores/fhirTokenStore';
    import axios from 'axios';
    import { onMount } from "svelte";
    import type { Bundle, BundleEntry, Observation, OperationOutcome } from "fhir/r4";

    // Define Svelte props
    export let patient: string;
    export let accessToken: string;


    // Initialize variable to store medication request data
    let labReports:BundleEntry<Observation>;

    // Function to fetch medication request data from FHIR API
    const getLabReports = async (patient: string, accessToken: string) => {
        try {
            const response = await axios.get<Bundle<Observation|OperationOutcome>>(`${BASE_URL}/Observation?patient=${patient}&category=laboratory`, {
            //const response = await axios.get<Bundle<Observation|OperationOutcome>>(`${BASE_URL}/Observation?patient=${patient}&category=laboratory`, {
                headers: { "Authorization": `Bearer ${accessToken}` }
            });

            return response.data;
        } catch (error) {
            console.error('Error fetching Lab Reports data:', error);
            throw error; // Rethrow the error to be handled by the caller
        }
    }
onMount(async () => {
    if(patient && accessToken){
        const laboratory = await getLabReports(patient, accessToken)
         labReports = laboratory.entry?.filter<BundleEntry<Observation>>(entry => entry.resource?.resourceType ==="Observation")

    }
})

</script>

<main class="flex justify-left items-center h-full">
    {#if labReports}
    <div class="w-full sm:w-1/2 p-4">
        <h1 class="text-2xl font-bold mb-4">Laboratory Reports</h1>
        {#if labReports[0]}
        <div class="bg-white ">
            <p class="text-lg font-semibold mb-2">{labReports[0].resource.basedOn[0].display}</p>
            <p class="text-gray-600">{labReports[0].resource.valueQuantity.value}</p>
        </div>
        {:else}
        <p class="text-red-500">No lab reports available</p>
        {/if}
    </div>
    {/if}
</main>


<style>

</style>