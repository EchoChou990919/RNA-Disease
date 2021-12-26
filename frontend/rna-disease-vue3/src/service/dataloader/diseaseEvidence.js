// import axios from "axios";

// let cache=null;
import evidence from "/public/evidence.json";

export function loadDiseaseEvidence(){
    // if(cache){
    //     return cache;
    // }
    // const response = await axios.get(`/evidence.json`);
    // cache=response.data;
    // return cache;
    return evidence;
}