import { loadNodeLinks } from "./nodelinks";
import _ from "lodash";

import diseaseAttrs from "/public/diseaseAttrs.json";
import w_result from "/public/w_result.json";


export function loadDiseaseAttrs(){
    return diseaseAttrs;
}

export function loadWResult(){
    return w_result;
}

export function doid2name(diseaseAttr){
    return _(diseaseAttr).map(item=>[item.DOID,item.Name]).fromPairs().value();
}

export function loadDiseaseDetail(){
    const nodelinks= loadNodeLinks();
    const diseaseAttrs= loadDiseaseAttrs();
    const w_result= loadWResult();
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