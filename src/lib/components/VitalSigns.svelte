<script lang="ts">
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import 'chartjs-adapter-date-fns';
    import { enUS } from 'date-fns/locale';
    import type { Bundle, Observation } from "fhir/r4";
    import axios from "axios";
    import { BASE_URL } from "../../stores/fhirTokenStore";

    export let patient: string;
    export let accessToken: string;

    let bloodPressureChart: any;
    let temperatureChart: any;
    let weightChart: any;

    // Initialize arrays to store specific vital sign readings
    let bloodPressureReadings: { dateTime: string, systolic: number, diastolic: number }[] = [];
    let temperatureReadings: { dateTime: string, temperature: number }[] = [];
    let weightReadings: { dateTime: string, weight: number }[] = [];

    const getObservations = async (patient: string, accessToken: string) => {
        try {
            const response = await axios.get(`${BASE_URL}/Observation/?patient=${patient}&category=vital-signs`, {
                headers: { "Authorization": `Bearer ${accessToken}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching vital signs data:', error);
            throw error;
        }
    };

    const extractObservations = async (patient: string, accessToken: string) => {
        try {
            const observations = await getObservations(patient, accessToken);

            observations.entry.forEach(entry => {
                const observation = entry.resource;
                if (observation.code && observation.code.coding) {
                    const bloodPressureCode = observation.code.coding.find(coding => coding.code === '8462-4');
                    if (bloodPressureCode) {
                        const systolic = observation.component.find(component => component.code.coding[0].code === '8480-6').valueQuantity.value;
                        const diastolic = observation.component.find(component => component.code.coding[0].code === '8462-4').valueQuantity.value;
                        bloodPressureReadings.push({ systolic, diastolic, dateTime: observation.effectiveDateTime });
                    }

                    const temperatureCode = observation.code.coding.find(coding => coding.code === '8310-5');
                    if (temperatureCode) {
                        const temperature = observation.valueQuantity.value;
                        temperatureReadings.push({ temperature, dateTime: observation.effectiveDateTime });
                    }

                    const weightCode = observation.code.coding.find(coding => coding.code === '29463-7');
                    if (weightCode) {
                        const weight = observation.valueQuantity.value;
                        weightReadings.push({ weight, dateTime: observation.effectiveDateTime });
                    }
                }
            });

            return { bloodPressureReadings, temperatureReadings, weightReadings };
        } catch (error) {
            console.error('Error fetching blood pressures, temperatures, and weights:', error);
            throw error;
        }
    };

    onMount(async () => {
        if (patient) {
            const { bloodPressureReadings, temperatureReadings, weightReadings } = await extractObservations(patient, accessToken);
            const systolicBloodPressureData = bloodPressureReadings.map(reading => ({ x: reading.dateTime, y: reading.systolic }));
            const diastolicBloodPressureData = bloodPressureReadings.map(reading => ({ x: reading.dateTime, y: reading.diastolic }));
            const temperatureData = temperatureReadings.map(reading => ({ x: reading.dateTime, y: reading.temperature }));
            const weightData = weightReadings.map(reading => ({ x: reading.dateTime, y: reading.weight }));

            const bloodPressureCanvas = document.getElementById('bloodPressureChart') as HTMLCanvasElement;
            const temperatureCanvas = document.getElementById('temperatureChart') as HTMLCanvasElement;
            const weightCanvas = document.getElementById('weightChart') as HTMLCanvasElement;


            bloodPressureChart = new Chart(bloodPressureCanvas, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Systolic Blood Pressure',
                        data: systolicBloodPressureData,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    },
                    {
                        label: "Diastolic Blood Pressure",
                        data: diastolicBloodPressureData,
                        tension: 0.1,
                        borderColor: '#87ceeb'
                    }
                
                ]
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            adapters: { 
                                date: {
                                locale: enUS, 
                                },
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Blood Pressure'
                            }
                        }
                    }
                }
            });

            temperatureChart = new Chart(temperatureCanvas, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Temperature',
                        data: temperatureData,
                        borderColor: 'rgb(54, 162, 235)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                            adapters: { 
                                date: {
                                locale: enUS, 
                                },
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Temperature (°C)'
                            }
                        }
                    }
                }
            });

            weightChart = new Chart(weightCanvas, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Weight',
                        data: weightData,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        x: {
                            type: 'time',
                        adapters: { 
                           date: {
                                 locale: enUS, 
                                 },
                             }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Weight (kg)'
                            }
                        }
                    }
                }
            });
        }
    });

</script>
<main>
    <h1 class="text-2xl p-4 font-bold mb-4">Vitals</h1>
    <div class="flex justify-center">
        <section class="w-full sm:w-1/2 p-4 bg-white shadow-lg">
            <h1 class="text-lg font-bold mb-4">Blood Pressure</h1>
            <canvas id="bloodPressureChart" class="chart w-full h-60"></canvas>
        </section>
        
        <section class="w-full sm:w-1/2 p-4 bg-white shadow-lg">
            <h1 class="text-lg font-bold mb-4">Temperature</h1>
            <canvas id="temperatureChart" class="chart w-full h-60"></canvas>
        </section>
        <section class="w-full sm:w-1/2 p-4 bg-white  shadow-lg">
            <h1 class="text-lg font-bold mb-4">Weight</h1>
            <canvas id="weightChart" class="chart w-full h-60"></canvas>
        </section>
    </div>


</main>



<style>
</style>