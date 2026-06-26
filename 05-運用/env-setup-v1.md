# IHL env setup v2・・螻､繝｢繝・Ν・・
## 逶ｮ逧・
- **隗ｦ縺｣縺ｦ縺ｯ縺・￠縺ｪ縺・ｱ､** 縺ｨ **險ｭ螳壹〒縺阪ｋ螻､** 繧貞・髮｢縺励※縲∽ｺ区腐邱ｨ髮・ｒ貂帙ｉ縺吶・- Docker / collector / runbook 縺ｮ隱ｭ縺ｿ蜈医ｒ蜷後§2螻､讒区・縺ｫ縺昴ｍ縺医ｋ縲・- 遘伜ｯ・､縺ｯ蠑輔″邯壹″繧ｳ繝溘ャ繝医＠縺ｪ縺・ｼ医ユ繝ｳ繝励Ξ繝ｼ繝医・縺ｿ蜈ｱ譛会ｼ峨・
## 繝輔ぃ繧､繝ｫ讒区・・域ｭ｣譛ｬ・・
| 遞ｮ蛻･ | 繝代せ | 蠖ｹ蜑ｲ | 邱ｨ髮・ｸｻ菴・|
|------|------|------|----------|
| 螳溷､・亥渕逶､・・| `謖・､ｺ/it-hercules-laboratory/.env.platform` | R2繝ｻGMO繝ｻCloudflare 縺ｪ縺ｩ蝓ｺ逶､蛟､ | admin/deploy |
| 螳溷､・医Ο繝ｼ繧ｫ繝ｫ・・| `謖・､ｺ/it-hercules-laboratory/.env.local` | SwitchBot繝ｻcollector繝ｻ遶ｯ譛ｫ萓晏ｭ伜､ | user/dev |
| 繝・Φ繝励Ξ・亥渕逶､・・| `謖・､ｺ/it-hercules-laboratory/.env.platform.example` | 蝓ｺ逶､蛟､縺ｮ髮帛ｽ｢ | 蜈ｱ譛牙庄 |
| 繝・Φ繝励Ξ・医Ο繝ｼ繧ｫ繝ｫ・・| `謖・､ｺ/it-hercules-laboratory/.env.local.example` | 繝ｭ繝ｼ繧ｫ繝ｫ蛟､縺ｮ髮帛ｽ｢ | 蜈ｱ譛牙庄 |
| 譌ｧ繝・Φ繝励Ξ | `謖・､ｺ/it-hercules-laboratory/.env.example` | 莠呈鋤譯亥・縺ｮ縺ｿ・磯撼謗ｨ螂ｨ・・| 蜿ら・縺ｮ縺ｿ |

> 蜴溷援: 騾壼ｸｸ驕狗畑縺ｧ繝ｦ繝ｼ繧ｶ繝ｼ縺ｯ **`.env.local` 縺ｮ縺ｿ邱ｨ髮・*縲・ 
> `.env.platform` 縺ｯ縲瑚ｧｦ縺｣縺ｦ縺ｯ縺・￠縺ｪ縺・肴桶縺・ｼ亥､画峩縺ｯ邂｡逅・・焔鬆・ｼ峨・
## Docker Compose 縺ｮ隱ｭ霎ｼ鬆・
`docker-compose.yml` 縺ｯ蜈ｨ繧ｵ繝ｼ繝薙せ縺ｧ谺｡縺ｮ鬆・↓隱ｭ縺ｿ霎ｼ繧:

1. `.env.platform`
2. `.env.local`
3. `.env`・・egacy fallback・・
蠕後ｍ縺ｮ繝輔ぃ繧､繝ｫ縺悟酔蜷阪く繝ｼ繧剃ｸ頑嶌縺阪☆繧具ｼ・ompose 縺ｮ `env_file` 莉墓ｧ假ｼ峨・
## 繧ｭ繝ｼ蜑ｲ蠖難ｼ郁ｦ∫ｴ・ｼ・
| 繧ｭ繝ｼ鄒､ | 驟咲ｽｮ蜈・| 逅・罰 |
|-------|-------|------|
| `R2_*` / `R2_IHL_BUCKET` / `CF_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | `.env.platform` | 繧､繝ｳ繝輔Λ繝ｻ驕狗畑閠・ｮ｡逅・|
| `GMO_*` / `GMO_CONNECTOR_MODE` | `.env.platform` | 驥題檮謗･邯壹・莠ｺ髢薙ご繝ｼ繝亥ｯｾ雎｡ |
| `SWITCHBOT_*` | `.env.local` | 繝ｦ繝ｼ繧ｶ繝ｼ讖溷勣縺斐→縺ｮ險ｭ螳・|
| `ENV_COLLECTOR_PRIVATE_KEY_PEM_BASE64` / `ENV_COLLECTOR_PUBLIC_KEY*` | `.env.local` | 遶ｯ譛ｫ繝ｭ繝ｼ繧ｫ繝ｫ collector 骰ｵ |
| `CIV_*` / `ENV_PLACEMENT_ID` / `ENV_ANNOTATION_ID` | `.env.local` | 繝ｭ繝ｼ繧ｫ繝ｫ蜿朱寔譁・ц |
| `IHL_DEV_*` / `IHL_API_URL` / `NEXT_PUBLIC_*`・亥・髢句､縺ｮ縺ｿ・・| `.env.local` | 髢狗匱閠・・繝ｭ繝ｼ繧ｫ繝ｫ謖吝虚 |

## 1蝗槭□縺代・遘ｻ陦梧焔鬆・ｼ域立 `.env` 縺九ｉ・・
1. 繝・Φ繝励Ξ繝ｼ繝医ｒ繧ｳ繝斐・
   - `copy .env.platform.example .env.platform`
   - `copy .env.local.example .env.local`
2. 譌｢蟄・`.env` 縺後≠繧句ｴ蜷医・蛻・牡繧ｹ繧ｯ繝ｪ繝励ヨ繧貞ｮ溯｡鯉ｼ亥､縺ｯ繝ｭ繧ｰ蜃ｺ蜉帙＠縺ｪ縺・ｼ・   - `node scripts/merge-env-split.mjs`
3. collector 蜈ｬ髢矩嵯繧貞・蜷梧悄・亥ｿ・ｦ∵凾・・   - `node collector/sync-public-key-from-collector.mjs`
4. 襍ｷ蜍慕｢ｺ隱・   - API + Web: `docker compose up api web`
   - collector: `docker compose --profile collector up collector`

## 豕ｨ諢丈ｺ矩・
- `.env.platform` / `.env.local` / `.env` 縺ｯ縺吶∋縺ｦ gitignore・育ｧ伜ｯ・､繧ｳ繝溘ャ繝育ｦ∵ｭ｢・峨・- 譛ｬ逡ｪ驕狗畑縺ｧ縺ｯ GitHub/CI Secrets 繧呈ｭ｣譛ｬ縺ｨ縺励√Ο繝ｼ繧ｫ繝ｫ繝輔ぃ繧､繝ｫ縺ｯ驕狗畑陬懷勧縺ｫ髯仙ｮ壹☆繧九・
## 2026-06-21 Migration Note
- migration done by agent (A90) for env split and archive workflow.
- active env files are .env.platform + .env.local; legacy files were moved to _archive/env-legacy/ and gitignored.
- after migration, refresh /settings/devices to reload runtime status.

