import ellipseAsset from "../assets/ui/Ellipse 9.png";
import upperPatternAsset from "../assets/ui/Group 24.png";
import lowerPatternAsset from "../assets/ui/Group 25.png";

export function Onboarding({ isReady, onDismiss }: { isReady: boolean; onDismiss: () => void }) {
  return (
    <main className="app-canvas onboarding-canvas" aria-busy={!isReady}>
      <section className="onboarding-hero" aria-hidden="true">
        <img className="hero-asset hero-asset--ellipse" src={ellipseAsset} alt="" />
        <img className="hero-asset hero-asset--upper-pattern" src={upperPatternAsset} alt="" />
        <img className="hero-asset hero-asset--lower-pattern" src={lowerPatternAsset} alt="" />
      </section>
      <section className="onboarding-copy"><h1>Manage What To Do</h1><p>The best way to manage what you have to do, don&apos;t forget your plans.</p></section>
      <button type="button" onClick={onDismiss} className="primary-button onboarding-button" disabled={!isReady}>Get Started</button>
    </main>
  );
}
