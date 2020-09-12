import { createContext } from "react";
import { action, observable } from "mobx";
import random from "crypto-random-string";

import { readMetadata, writeMetadata } from "../utils/path";
import { graphData } from "../types/graph";

class GraphState {
  @observable
  data: graphData = { nodes: [], links: [] };

  @action
  async addFile(name: string) {
    const fname = `${name}.md`;
    const id = random({ length: 48, type: "hex" });

    const newMetadata = Object.assign({}, this.data); // hack lol

    newMetadata.nodes = [
      ...newMetadata.nodes,
      {
        id,
        title: name,
        payload: {
          fileName: fname,
        },
      },
    ];

    await writeMetadata({
      version: 1,
      graphData: newMetadata,
    });

    await this.hydrateMetadata();
  }

  @action
  async saveMetadata() {
    await writeMetadata({
      version: 1,
      graphData: this.data,
    });
  }

  @action
  async hydrateMetadata() {
    try {
      const metadata = await readMetadata();
      this.data = metadata.graphData;
    } catch (e) {
      console.error(e);
      console.log("Writing empty metadata");

      await this.saveMetadata();
    }
  }
}

const GraphStateContext = createContext(new GraphState());
export { GraphStateContext };
