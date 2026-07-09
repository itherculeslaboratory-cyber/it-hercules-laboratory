import type { W2ComponentProps } from "@ihl/ui-catalog/types/w2";
import {
  ProfileContentArea,
  ProfilePrimaryAction,
  ProfileStatePanel,
} from "@ihl/ui-catalog/components/features/profile";
import { W2ShellOnly } from "./withW2Shell";

const ID = "ihl-profile-three-metrics";

/** P0 — マイページ / 通知 · charter Q1 導線 · screenId 差分は catalog 側 */
export function ProfileContentAreaW2(props: W2ComponentProps) {
  const { onNavigate, screenId } = props;
  return (
    <W2ShellOnly feature="profile">
      <ProfileContentArea {...props} />
      <nav className="w2-hand-shell__footer w2-hand-shell__footer--profile" aria-label="マイページ導線">
        {screenId === "PR" ? (
          <>
            <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("PRnotif")}>
              通知一覧
            </button>
            <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("08")}>
              カルマ詳細
            </button>
            <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("14")}>
              貢献度
            </button>
          </>
        ) : (
          <>
            <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("PR")}>
              プロフィール
            </button>
            <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("06a")}>
              マーケット
            </button>
          </>
        )}
        <button type="button" className="w2-hand-shell__link" onClick={() => onNavigate?.("01")}>
          ホーム
        </button>
      </nav>
    </W2ShellOnly>
  );
}

export function ProfilePrimaryActionW2(props: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__PrimaryAction`} data-w2-patched="true">
      <ProfilePrimaryAction {...props} />
    </div>
  );
}

export function ProfileStatePanelW2(props: W2ComponentProps) {
  return (
    <div data-component-id={`${ID}__StatePanel`} data-w2-patched="true">
      <ProfileStatePanel {...props} />
    </div>
  );
}
