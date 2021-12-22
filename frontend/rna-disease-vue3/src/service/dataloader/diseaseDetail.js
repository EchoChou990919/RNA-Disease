import { loadNodeLinks } from "./nodelinks";

import axios from "axios";
import _ from "lodash";

let attrsCache=null;
let resultCache=null;

export async function loadDiseaseAttrs(){
    if(attrsCache){
        return attrsCache;
    }
    const res = await axios.get("/diseaseAttrs.json");
    attrsCache = res.data;
    return attrsCache;
}

export async function loadWResult(){
    if(resultCache){
        return resultCache;
    }
    const res = await axios.get("/w_result.json");
    resultCache = res.data;
    return resultCache;
}

export async function loadDiseaseDetail(){
    const nodelinks=await loadNodeLinks();
    const diseaseAttrs=await loadDiseaseAttrs();
    const w_result=await loadWResult();
    const DISEASE_CATEGORY=1;
    const disease_nodes=nodelinks.nodes.filter(node=>node.category==DISEASE_CATEGORY);
    const disease_attr_with_id=disease_nodes.map(disease=>{
        const disease_attr = diseaseAttrs.diseases.find(diseaseAttr => diseaseAttr.DOID==disease.name);
        return {...disease, ...disease_attr};
    })
    const disease_attr_with_result=disease_attr_with_id.map(disease=>{
        let result=w_result.prediction_result.filter(result=>result.disease_index==disease.id);
        return {...disease, result};
    });
    return disease_attr_with_result;
}