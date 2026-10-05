# Void Vigil: The Cinder Reach Crusade

A single-file, turn-based sci-fi strategy RPG. You lead a Cohort of armoured crusaders across a dying star region, fight grid battles, and build up your squad between fights.

**Original setting:** all names, factions, places and lore in this game are original. Units are drawn as simple shapes; there is no third-party artwork.

**Play online:** https://stephenhunter.github.io/void-vigil/

## How to run
- **In a browser:** open the link above, or download `index.html` and double-click it (Chrome, Edge or Firefox).
- No build step, server, install or network connection is needed. It's built for a desktop browser with a mouse.

## The setting
The Cinder Reach is coming apart. The **Void Vigil**, an order of ash-armoured crusaders sworn to the Concord, sends your Cohort to hold it. Against you:

- **Grakk Horde:** brutal, scrap-armoured raiders. In round 2 of a battle they unleash a Blood-Howl (+2 move).
- **Revenants:** the iron dead of ancient ossuaries. Struck-down Revenants may drag themselves back up.
- **Vorrid Swarm:** a fast, endless bio-swarm that devours whole worlds.
- **Ashen Choir:** a corruption cult whose hexers burn and taint your Sworn. They serve **Vhar'kul the Unmade**, a fallen demigod in the Weeping Citadel.

## How to play
1. **New Crusade:** name your Vigil-Marshal and pick the House that raised him.
2. **Houses:** every Sworn in your Cohort keeps his own House and its passive bonus:

   | House | Passive |
   |---|---|
   | Aurelan | +5% hit |
   | Carrow | +2 melee damage |
   | Veyle | +1 armour |
   | Rimeholt | +15% melee hit, +2 HP |
   | Bastian | +15% hit with Rotary Cannon / Beam Cannon |
   | Pyrrhan | +2 damage with Pyre Casters and Cinder Rounds |
   | Kestral | +1 move |
   | Umbrael | Enemies get -30% to hit him in rounds 1–2 |

   The Cohort also deals **+1 damage** to the Grakk Horde, Revenants and Vorrid Swarm (not the Ashen Choir).
3. **Star map:** click a system inside a gold dashed ring, then **Deploy**. Every move uses one campaign turn. Unclaimed worlds join you right away; enemy worlds start a battle. Between turns, enemies counterattack, spread, and grow stronger.
4. **Battle (10x8 grid):** click a Sworn, then click a blue tile to move, or click an enemy to shoot it (melee if adjacent). Each Sworn gets one move and one action per round, plus a class ability on a cooldown:
   - Vigil-Marshal: Oath of Fury (Cohort-wide +15% hit, +1 damage)
   - Vanguard: Frag Charge (3x3 blast)
   - Breacher: Breach Rocket (Dmg 7, AP 3)
   - Field Surgeon: Suture Kit (heal 6)
   - Void Oracle: Void Lash (5 damage, always hits)

   **Munitions** switches rounds before he acts. **End Turn** (or the `E` key) hands over to the enemy.
5. **Armoury:** spend Supply on armaments, unlock Munitions for slug weapons (Sabot: +2 AP, +1 range; Overcharged: +2 damage, -10% hit; Cinder: ignores cover), recruit Sworn, heal at the Infirmary, and refit your vigil-ship *Unbowed*.
6. **Marshal honours:** each time the Marshal levels up, pick 1 of 3: Warding Crown, Blademaster, Master Marksman, Inspiring Presence, Fleet Tactician, Bane of the Unclean, Unyielding, Concord Patronage, Mentor of the Vigil.
7. **Win:** take the Weeping Citadel and slay Vhar'kul the Unmade by turn 40.
   **Lose:** Bastion Kepler falls, or turn 40 runs out.

Fallen Sworn are gone for good and go in the Ledger of Ashes. The Marshal can be struck down, but he always survives.
The game saves automatically every campaign turn (browser localStorage, key `voidVigil.cinderReach.save.v1`), and there's also a manual Save button.

## Tests
Install with `npm i`. The tests expect Chrome at `/usr/bin/google-chrome`.
- `node tests/test.js`: smoke test plus screenshots in `screens/`
- `node tests/test.js --full`: bot plays a whole campaign
- `node tests/test_defeat.js`: defeat paths and battles against each faction
- `node tests/shot_citadel.js`: boss battle screenshot

## License
MIT, © 2026 Stephen Hunter. See [LICENSE](LICENSE).
