<script lang="ts">
    // Import statements
    import { CLIENT_ID, TOKEN_URL, REDIRECT_URL, RESPONSE_TYPE, SCOPE, BASE_URL, AUTH_URL, CV_LOCAL_STORAGE_KEY,ACCESS_TOKEN_KEY }
        from './stores/fhirTokenStore.ts';
    import axios from 'axios';
    import { onMount } from 'svelte';
    import pkceChallenge from "pkce-challenge";
    import PatientDemographics from './lib/components/PatientDemographics.svelte';
    import MedicationRequest from './lib/components/MedicationRequest.svelte';
    import VitalSigns from './lib/components/VitalSigns.svelte';
    import LabReports from './lib/components/LabReports.svelte';

    
    let loading = true;

    let acccessToken:any;
    let patient: string;
    let access_token: string;


    // Function to generate code verifier and challenge for PKCE
    const generateCodeVerifier = async () => {
        const { code_challenge, code_verifier } = await pkceChallenge();
        localStorage.setItem(CV_LOCAL_STORAGE_KEY, code_verifier); // Save code verifier in local storage
        //document.cookie = `${CV_LOCAL_STORAGE_KEY}=${code_verifier}`; 
        return code_challenge;
    };
    
    // Get date in seconds
    const getSeconds = (date: Date) => {

      return Math.round(date.getTime()/1000)

    }


  // step 1 & 2: 
    //https://fhir.epic.com/Documentation?docId=oauth2&section=standaloneOauth2Launch
    //Standalone Launch

    // Function to construct authorization URL with PKCE parameters
    const getRedirectUrl = (codeChallenge: string) => {
        const authorizeURL = new URL(AUTH_URL);
        authorizeURL.searchParams.set('client_id', CLIENT_ID);
        authorizeURL.searchParams.set('SCOPE', SCOPE);
        authorizeURL.searchParams.set('redirect_uri', REDIRECT_URL);
        authorizeURL.searchParams.set('RESPONSE_TYPE', RESPONSE_TYPE);
        //authorizeURL.searchParams.set('state', '1234567');
        authorizeURL.searchParams.set('aud', BASE_URL);
        authorizeURL.searchParams.set('code_challenge', codeChallenge);
        authorizeURL.searchParams.set('code_challenge_method', 'S256');
        
        return authorizeURL.href; // Return authorization URL (contains authorization code and state(if set))
    };

    //step 3: exchange code for auth token
    // Function to exchange authorization code for access token
    const postAccessTokenRequest = async (code: string, codeVerifier: string) => {
        const searchParams = new URLSearchParams();
        searchParams.set('grant_type', 'authorization_code');
        searchParams.set('code', code);
        searchParams.set('redirect_uri', REDIRECT_URL);
        searchParams.set('client_id', CLIENT_ID);
        searchParams.set('code_verifier', codeVerifier);

        try {
            const tokenGeneratedAt = getSeconds(new Date()) // get current date secs
            const response = await axios.post(TOKEN_URL, searchParams.toString());
            acccessToken = response.data
            localStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify({...acccessToken, issued_at_in_secs: tokenGeneratedAt}))
            //acccessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
            //return acccessToken

        } catch (error) {
            console.error('Error fetching access token:', error);
            throw error;
        }
    };


    // Execute code on component mount
    onMount(async () => {
        //const cookies = document.cookie.split(';');
        // const tokenResponseCookie: string = cookies.find(cookie => cookie.trim().startsWith(`${CV_LOCAL_STORAGE_KEY}=`));
        // const codeVerifier = tokenResponseCookie.split('=')[1];
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const code = urlParams.get('code');
        const codeVerifier = localStorage.getItem(CV_LOCAL_STORAGE_KEY);
        const storedAccessToken = localStorage.getItem(ACCESS_TOKEN_KEY)

        if (storedAccessToken) {
          //check for expiry. Remove accessToken if expired
          const tempAcccessToken = JSON.parse(storedAccessToken)
          const {issued_at_in_secs} = tempAcccessToken
          const expiresInSecs = issued_at_in_secs + tempAcccessToken.expires_in
          const nowInSecs = getSeconds(new Date())

          console.log(nowInSecs >= expiresInSecs)
          if(nowInSecs >= expiresInSecs){
            localStorage.removeItem(ACCESS_TOKEN_KEY)
          } else {
            acccessToken = tempAcccessToken
          }

        }
        if(!acccessToken){
          if (code && codeVerifier) {
            try {
                await postAccessTokenRequest(code, codeVerifier);
                localStorage.removeItem(CV_LOCAL_STORAGE_KEY); // Remove code verifier from local storage
            } catch (error) {
                console.log(error);
            }
          }
        }
    
        
        loading = false 
        patient = acccessToken.patient
        access_token = acccessToken.access_token
    });

    // Function to initiate the authentication request
    const initiateAuthRequest = async () => {
        const codeChallenge = await generateCodeVerifier();
        const redirect_url = getRedirectUrl(codeChallenge);
        window.location.href = redirect_url; // Redirect user to authorization URL
    };


</script>
<main>
  {#if loading}
    Loading...
  {:else} 

    {#if acccessToken}
      <PatientDemographics patient = {patient} accessToken = {access_token}></PatientDemographics>
      <br>

      <MedicationRequest patient = {patient} accessToken = {access_token}></MedicationRequest>
      <br>
      <LabReports patient = {patient} accessToken = {access_token}></LabReports>
      <br>
      <VitalSigns patient = {patient} accessToken = {access_token}></VitalSigns>
    {:else}

      <div class="h-screen flex items-center justify-center">
        <button on:click={initiateAuthRequest} class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Login With Epic
        </button>
      </div>
    {/if}

  {/if}
</main>

<style>
 
</style>

