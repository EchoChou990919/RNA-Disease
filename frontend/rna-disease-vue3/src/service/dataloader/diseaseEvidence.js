import evidence from "/public/evidence.json";

const connMtx={
    lncRNADisease:{},
    lncRNA2Cancer:{}
};
for (const record of evidence.lncRNADisease){
    if(!connMtx.lncRNADisease[record.lncRNA]){
        connMtx.lncRNADisease[record.lncRNA]={};
    }
    connMtx.lncRNADisease[record.lncRNA][record.disease]=record;
}
for (const record of evidence.lncRNA2Cancer){
    if(!connMtx.lncRNA2Cancer[record.lncRNA]){
        connMtx.lncRNA2Cancer[record.lncRNA]={};
    }
    connMtx.lncRNA2Cancer[record.lncRNA][record.cancer]=record;
}

export const lncDisConnMtx=connMtx;

export function loadDiseaseEvidence(){
    return evidence;
}