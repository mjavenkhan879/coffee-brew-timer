/**
 * CoffeeBrewTimer — screen state machine only. No brew logic lives here.
 * Loader -> Menu -> Dose -> Brew -> Summary (the mandatory result screen) -> Menu.
 */

import React, { useCallback, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import theme from './src/constants/theme';
import { methodById } from './src/game/methods';
import type { MethodId } from './src/game/methods';
import type { BrewResult } from './src/game/brewEngine';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import DoseSetupScreen from './src/screens/DoseSetupScreen';
import BrewTimerScreen from './src/screens/BrewTimerScreen';
import BrewSummaryScreen from './src/screens/BrewSummaryScreen';
import BrewLogScreen from './src/screens/BrewLogScreen';
import RecipeEditorScreen from './src/screens/RecipeEditorScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type Screen =
  | 'loader'
  | 'menu'
  | 'dose'
  | 'brew'
  | 'result'
  | 'log'
  | 'recipes'
  | 'settings';

function App(): React.JSX.Element {
  const [screen, setScreen] = useState<Screen>('loader');
  const [methodId, setMethodId] = useState<MethodId>('v60');
  const [dose, setDose] = useState(18);
  const [ratio, setRatio] = useState(15);
  const [result, setResult] = useState<BrewResult | null>(null);
  /** bumped on every start so the timer screen remounts with a fresh ticker */
  const [brewKey, setBrewKey] = useState(0);

  const goMenu = useCallback(() => setScreen('menu'), []);
  const goDose = useCallback(() => setScreen('dose'), []);
  const goLog = useCallback(() => setScreen('log'), []);
  const goRecipes = useCallback(() => setScreen('recipes'), []);
  const goSettings = useCallback(() => setScreen('settings'), []);

  const selectMethod = useCallback((id: MethodId) => {
    const method = methodById(id);
    setMethodId(id);
    setDose(method.defaultDose);
    setRatio(method.defaultRatio);
  }, []);

  const startBrew = useCallback(() => {
    setBrewKey(k => k + 1);
    setScreen('brew');
  }, []);

  const completeBrew = useCallback((next: BrewResult) => {
    setResult(next);
    setScreen('result');
  }, []);

  const brewAgain = useCallback(() => {
    setScreen('dose');
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {screen === 'loader' ? <LoaderScreen onDone={goMenu} /> : null}

      {screen === 'menu' ? (
        <MenuScreen
          methodId={methodId}
          onSelectMethod={selectMethod}
          onStart={goDose}
          onOpenLog={goLog}
          onOpenRecipes={goRecipes}
          onOpenSettings={goSettings}
        />
      ) : null}

      {screen === 'dose' ? (
        <DoseSetupScreen
          methodId={methodId}
          dose={dose}
          ratio={ratio}
          onDose={setDose}
          onRatio={setRatio}
          onBack={goMenu}
          onStart={startBrew}
        />
      ) : null}

      {screen === 'brew' ? (
        <BrewTimerScreen
          key={brewKey}
          methodId={methodId}
          dose={dose}
          ratio={ratio}
          onAbort={goMenu}
          onComplete={completeBrew}
        />
      ) : null}

      {screen === 'result' && result ? (
        <BrewSummaryScreen
          result={result}
          onBrewAgain={brewAgain}
          onMenu={goMenu}
          onOpenLog={goLog}
        />
      ) : null}

      {screen === 'log' ? <BrewLogScreen onBack={goMenu} onStart={goDose} /> : null}

      {screen === 'recipes' ? <RecipeEditorScreen onBack={goMenu} /> : null}

      {screen === 'settings' ? <SettingsScreen onBack={goMenu} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
});

export default App;
