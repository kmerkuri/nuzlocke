import create, { State, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import produce from 'immer';
import { AppState, TGame, TPokemon, TRule, TStatus } from 'constants/types';
import { GAMES, INITIAL_STATE } from 'constants/constant';
import BADGES from 'constants/badges';

const immer =
  <T extends State>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    config(
      (partial, replace) => {
        const nextState =
          typeof partial === 'function' ? produce(partial as (state: T) => T) : (partial as T);
        return set(nextState, replace);
      },
      get,
      api
    );

const useStore = create<AppState>(
  persist(
    immer((set) => ({
      badges: BADGES,
      darkMode: false,
      duplicates: false,
      games: INITIAL_STATE.games,
      gamesList: GAMES,
      newVersion: '1',
      nicknames: false,
      rules: INITIAL_STATE.rules,
      rulesets: INITIAL_STATE.rulesets,
      selectedGame: null,
      selectedRuleset: '1',
      text: '',
      addEncounter: (newLocation: string) =>
        set((state) => {
          state.games[state.selectedGame?.value].encounters.push({
            id: state.games[state.selectedGame?.value].encounters.length,
            location: newLocation,
            pokemon: null,
            status: null,
          });
        }),
      addGame: (newGame: string) =>
        set((state) => {
          const newKey = Number(state.gamesList[state.gamesList.length - 1].value) + 1;
          state.games[newKey.toString()] = { badge: null, encounters: [] };
          state.gamesList.push({
            value: newKey.toString(),
            text: newGame,
            key: `custom-game-${newGame}-${new Date()}`,
          });
        }),
      addRule: (newRule: string) =>
        set((state) => {
          state.rules[state.selectedRuleset]?.push({ content: newRule });
        }),
      addRuleset: (rulesetName: string) =>
        set((state) => {
          const newKey = Number(state.rulesets[state.rulesets.length - 1].value) + 1;
          state.rules[newKey.toString()] = [];
          state.rulesets.push({
            value: newKey.toString(),
            text: rulesetName,
            key: `custom-ruleset-${rulesetName}-${new Date()}`,
          });
        }),
      changeDupe: () =>
        set((state) => {
          state.duplicates = !state.duplicates;
        }),
      changeNickname: (encounterId: number, nickname: string) =>
        set((state) => {
          const index = state.games[state.selectedGame?.value].encounters.findIndex((enc) => {
            return enc.id === encounterId;
          });
          if (index !== -1)
            state.games[state.selectedGame?.value].encounters[index].nickname = nickname;
        }),
      changePokemon: (encounterId: number, pokemon: TPokemon) =>
        set((state) => {
          const index = state.games[state.selectedGame?.value].encounters.findIndex((enc) => {
            return enc.id === encounterId;
          });
          if (index !== -1)
            state.games[state.selectedGame?.value].encounters[index].pokemon = pokemon;
        }),
      changeRuleset: (rulesetId: string) =>
        set((state) => {
          state.selectedRuleset = rulesetId;
        }),
      changeStatus: (encounterId: number, status: TStatus) =>
        set((state) => {
          const index = state.games[state.selectedGame?.value].encounters.findIndex((enc) => {
            return enc.id === encounterId;
          });
          if (index !== -1)
            state.games[state.selectedGame?.value].encounters[index].status = status;
        }),
      clearEncounter: (encounterId: number) => {
        set((state) => {
          const index = state.games[state.selectedGame?.value].encounters.findIndex((enc) => {
            return enc.id === encounterId;
          });
          if (index !== -1) state.games[state.selectedGame?.value].encounters[index].status = null;
          if (index !== -1) state.games[state.selectedGame?.value].encounters[index].pokemon = null;
          if (index !== -1)
            state.games[state.selectedGame?.value].encounters[index].nickname = null;
        });
      },
      deleteEncounter: (encounterId: number) =>
        set((state) => {
          const index = state.games[state.selectedGame?.value].encounters.findIndex((enc) => {
            return enc.id === encounterId;
          });
          if (index !== -1) state.games[state.selectedGame?.value].encounters.splice(index, 1);
        }),
      deleteGame: () =>
        set((state) => {
          delete state.games[state?.selectedGame.value];
          const gameIndex = state.gamesList.findIndex(
            (game) => game.value === state?.selectedGame.value
          );
          state.gamesList.splice(gameIndex, 1);
          state.selectedGame = null;
        }),
      deleteRule: (ruleIndex: number) =>
        set((state) => {
          state.rules[state.selectedRuleset].splice(ruleIndex, 1);
        }),
      deleteRuleset: () =>
        set((state) => {
          delete state.rules[state.selectedRuleset];
          const rulesetIndex = state.rulesets.findIndex(
            (game) => game.value === state?.selectedRuleset
          );
          state.rulesets.splice(rulesetIndex, 1);
          state.selectedRuleset = '1';
        }),
      editBadge: (newBadge: string, i: number) =>
        set((state) => {
          state.badges[state.selectedGame?.value][i].levelCap = newBadge;
        }),
      editRule: (newRule: string, i: number) =>
        set((state) => {
          state.rules[state.selectedRuleset][i].content = newRule;
        }),
      importState: (newAppState: Partial<AppState>) =>
        set((state) => {
          state.games = newAppState.games;
          state.selectedGame = newAppState.selectedGame;
          state.gamesList = newAppState.gamesList;
          if (newAppState.badges) state.badges = newAppState.badges;
          if (newAppState.rules) state.rules = newAppState.rules;
          if (newAppState.rulesets) state.rulesets = newAppState.rulesets;
        }),
      removeNew: () =>
        set((state) => {
          state.newVersion = '2.6.0';
        }),
      reorderRule: (destinationId: number, rule: TRule, sourceId: number) =>
        set((state) => {
          state.rules[state.selectedRuleset]?.splice(sourceId, 1);
          state.rules[state.selectedRuleset]?.splice(destinationId, 0, rule);
        }),
      resetAll: () =>
        set((state) => {
          state.games[state.selectedGame?.value].encounters = !!INITIAL_STATE.games[
            state.selectedGame?.value
          ]?.encounters
            ? INITIAL_STATE.games[state.selectedGame.value].encounters
            : [];
        }),
      resetBadges: () =>
        set((state) => {
          state.badges[state.selectedGame?.value] = BADGES[state.selectedGame?.value];
        }),
      selectGame: (game: TGame) =>
        set((state) => {
          state.selectedGame = game;
        }),
      selectBadge: (badgeIndex: number) =>
        set((state) => {
          if (state.games[state.selectedGame?.value]?.badge === badgeIndex) {
            state.games[state.selectedGame?.value].badge -= 1;
          } else {
            state.games[state.selectedGame?.value].badge = badgeIndex;
          }
        }),
      search: (text: string) =>
        set((state) => {
          state.text = text;
        }),
      toggleMode: () => {
        set((state) => {
          state.darkMode = !state.darkMode;
        });
      },
      toggleNickname: () => {
        set((state) => {
          state.nicknames = !state.nicknames;
        });
      },
    })),
    { name: 'pokemon-tracker' }
  )
);

export default useStore;
