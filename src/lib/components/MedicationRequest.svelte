<script lang="ts">
    // Import necessary types and libraries
    import type { Bundle, MedicationRequest } from "fhir/r4";
    import { BASE_URL } from "../../stores/fhirTokenStore";
    import axios from "axios";
    import { onMount } from "svelte";

    // Define Svelte props
    export let patient: string;
    export let accessToken: string;

    // Initialize variable to store medication request data
    let MedicationRequestData: object | null;

    // Function to fetch medication request data from FHIR API
    const getMedicationRequest = async (patient: string, accessToken: string) => {
        try {
            const response = await axios.get<Bundle<MedicationRequest>>(`${BASE_URL}/MedicationRequest/?patient=${patient}`, {
                headers: { "Authorization": `Bearer ${accessToken}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching medication request data:', error);
            throw error; // Rethrow the error to be handled by the caller
        }
    }

    // Fetch medication request data on component mount
    onMount(async () => {
        if (patient) {
            MedicationRequestData = await getMedicationRequest(patient, accessToken);
        }
    })

</script>


<main class="flex justify-left items-center h-full">
    {#if MedicationRequestData}
    <div class="w-full sm:w-1/2 p-4">
        <h1 class="text-2xl font-bold mb-4">Medications</h1>
        <div class="scrollable-table">
            <table class="w-full">
                <thead>
                    <tr>
                        <th class="py-2">Medication Name</th>
                        <th class="py-2">Validity Period Start</th>
                    </tr>
                </thead>
                <tbody>
                    {#each { length: MedicationRequestData.total } as _, i}
                    <tr class="hover:bg-gray-100">
                        <td class="py-2">{MedicationRequestData?.entry[i].resource?.medicationReference?.display}</td>
                        <td class="py-2">{MedicationRequestData.entry[i].resource?.dispenseRequest?.validityPeriod?.start}</td>
                    </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
    {:else}
    <p class="text-red-500">Error loading medication list</p>
    {/if}
</main>

