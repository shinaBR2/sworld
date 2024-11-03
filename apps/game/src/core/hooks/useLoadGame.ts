import { useLoaderData, useParams } from "@tanstack/react-router";
import BobbleDungeonGame from "../../games/bobble-dungeon/Game";

export const useLoadGame = () => {
  const Component = useLoaderData({ from: "/$gameSlug" });
  // const params = useParams({ strict: false });

  return Component;
};

export const fetchGameFromSlug = async (gameSlug: string) => {
  if (gameSlug == "bobble-dungeon") {
    return BobbleDungeonGame;
  }

  return undefined;
};