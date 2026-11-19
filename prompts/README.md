# Portable prompt pack

This folder lets any LLM community use the same contract without DeepSeek Harness.

| File | Use |
| --- | --- |
| `suanming.prompt.md` | Paste as the system prompt / custom instructions / Project instructions for ChatGPT, Claude, Gemini, DeepSeek, Qwen, Kimi, or a local model. |
| `suanming.spec.json` | Machine-readable list of the nine systems and their minimum required data, for building your own validator or agent tool. |

## How to use

1. Open the model's custom-instruction surface (ChatGPT: Custom instructions or a Project; Claude: Project instructions or a Style; Gemini: Gem; DeepSeek: a new chat with the prompt pasted first).
2. Paste the **entire** content of `suanming.prompt.md`.
3. Provide chart data in this shape:

```
体系：紫微斗数
数据来源：本地排盘工具
命盘信息：<paste the chart>
问题主题：事业
用户补充：<situation and what to focus on>
```

## What stays different in the DSH bundle

The DSH bundle adds two things a raw prompt cannot guarantee:

- a `suanming` skill, so the contract is loaded only when a reading is requested;
- a `suanming_intake` tool, so "is the data complete?" and "which questions must I ask?" are answered deterministically instead of by model judgement.

## License

MIT. Fork, translate, and ship it; keep the boundary rules intact.
