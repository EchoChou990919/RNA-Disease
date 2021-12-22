import axios from "axios";
import _ from "lodash";

export async function loadCase(){
    const res = await axios.get("/case.json");
    return res.data;
}