<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import type { Patient } from "fhir/r4";
    import axios from 'axios';
    import {BASE_URL} from '../../stores/fhirTokenStore'
    
    // Define patient prop
    export let patient: string;
    export let accessToken: string;
    let patientData: Patient | null;
 
    // Load patient data
    const loadPatient = async (patient: string, accessToken: string) => {
        try {
            const response = await axios.get<Patient>(`${BASE_URL}/Patient/${patient}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            // Return patient data
            return response.data;
        } catch (error) {
            console.error('Error loading patient:', error);
            // Return null or handle error appropriately
            return null;
        }
    }

    onMount(async () => {
        if (patient) {
            patientData = await loadPatient(patient,accessToken);
        }
    });

</script>

<main>
    {#if patientData}
        <header class="bg-white shadow">
            <div class="container mx-auto">
                <div class="mb-4 text-4xl">{patientData?.name[0]?.given?.join(' ')} {patientData?.name[0]?.family}</div>
                <div class="mt-4 flex flex-col sm:flex-row sm:justify-between">
                    <div>
                        <span class="text-sm text-gray-600">GENDER:</span>
                        <span class="mr-4 text-black">{patientData?.gender} </span>
                        <span class="text-sm text-gray-600">DOB:</span>
                        <span class="mr-4 text-black"> {patientData?.birthDate} </span>
                    </div>
                    <div class="mt-2 sm:mt-0">
                        <span class="text-sm text-gray-600">{patientData?.identifier[0]?.type?.text} ID: {patientData?.identifier[0]?.value}</span>
                    </div>
                </div>
            </div>
        </header>
    {:else}
        <h1>Error loading patient</h1>
    {/if}
</main>

<style>

</style>
