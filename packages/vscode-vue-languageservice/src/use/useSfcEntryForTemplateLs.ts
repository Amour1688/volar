import { TextDocument } from 'vscode-languageserver-textdocument';
import { computed, Ref } from '@vue/reactivity';
import * as SourceMaps from '../utils/sourceMaps';
import * as upath from 'upath';
import { SearchTexts } from '../utils/string';
import * as shared from '@volar/shared';

export function useSfcEntryForTemplateLs(
	vueUri: string,
	vueDoc: Ref<TextDocument>,
	script: Ref<shared.Sfc['script']>,
	scriptSetup: Ref<shared.Sfc['scriptSetup']>,
	template: Ref<shared.Sfc['template']>,
	hasTsDoc: Ref<boolean>,
) {
	let version = 0;
	const textDocument = computed(() => {
		const uri = `${vueUri}.ts`;
		const vueFileName = upath.basename(shared.uriToFsPath(vueUri));
		const tsScriptFileName = hasTsDoc.value ? '__VLS_script_ts' : '__VLS_script';
		let content = '';
		content += '// @ts-nocheck\n';
		if (scriptSetup.value || script.value) {
			content += `import { __VLS_options as __VLS_options_ts, __VLS_name as __VLS_name_ts } from './${vueFileName}.${tsScriptFileName}';\n`;
			content += `import { __VLS_options, __VLS_name } from './${vueFileName}.__VLS_script';\n`;
			content += `export { __VLS_options, __VLS_name } from './${vueFileName}.__VLS_script';\n`;
			content += `export * from './${vueFileName}.__VLS_script';\n`;

			if (scriptSetup.value) {
				content += `import { __VLS_component as __VLS_component_ts } from './${vueFileName}.${tsScriptFileName}';\n`;
				content += `import { __VLS_component } from './${vueFileName}.__VLS_script';\n`;
				content += `export { __VLS_component } from './${vueFileName}.__VLS_script';\n`;
			}
			else if (script.value) {
				content += `import __VLS_component_1_ts from './${vueFileName}.${tsScriptFileName}';\n`;
				content += `import __VLS_component_1 from './${vueFileName}.__VLS_script';\n`;
				content += `import { __VLS_component as __VLS_component_2_ts } from './${vueFileName}.${tsScriptFileName}';\n`;
				content += `import { __VLS_component as __VLS_component_2 } from './${vueFileName}.__VLS_script';\n`;
				content += `declare var __VLS_component_ts: __VLS_SelectComponent<typeof __VLS_component_1_ts, typeof __VLS_component_2_ts>;\n`;
				content += `export declare var __VLS_component: __VLS_SelectComponent<typeof __VLS_component_1, typeof __VLS_component_2>;\n`;
			}
		}
		else {
			content += `export var __VLS_options = {};\n`;
			content += `export var __VLS_name = undefined;\n`;
			content += `var __VLS_component_ts = __VLS_defineComponent({});\n`;
			content += `export var __VLS_component = __VLS_defineComponent({});\n`;
		}
		content += `declare var __VLS_ctx: __VLS_ComponentContext<typeof __VLS_component_ts>;\n`;
		content += `declare var __VLS_ComponentsWrap: typeof __VLS_options & { components: { } };\n`;
		content += `declare var __VLS_Components: typeof __VLS_ComponentsWrap.components & __VLS_GlobalComponents & __VLS_PickComponents<typeof __VLS_ctx> & __VLS_SelfComponent<typeof __VLS_name, typeof __VLS_component>;\n`;
		content += `__VLS_ctx.${SearchTexts.Context};\n`;
		content += `__VLS_Components.${SearchTexts.Components};\n`;
		content += `({} as __VLS_OptionsSetupReturns<typeof __VLS_options_ts>).${SearchTexts.SetupReturns};\n`;
		content += `({} as __VLS_OptionsProps<typeof __VLS_options_ts>).${SearchTexts.Props};\n`;
		content += `({} as __VLS_GlobalAttrs).${SearchTexts.GlobalAttrs};`;
		content += `\n`;
		content += `export default {} as typeof __VLS_component & {\n`;
		content += `__VLS_raw: typeof __VLS_component\n`;
		content += `__VLS_options: typeof __VLS_options,\n`;
		content += template.value ? `__VLS_slots: typeof import ('./${vueFileName}.__VLS_template').default,\n` : `// no template\n`;
		content += `};\n`;
		return TextDocument.create(uri, 'typescript', version++, content);
	});
	const sourceMap = computed(() => {
		if (textDocument.value) {
			const docText = textDocument.value.getText();
			const sourceMap = new SourceMaps.TsSourceMap(vueDoc.value, textDocument.value, 'template', false, {
				foldingRanges: false,
				formatting: false,
				documentSymbol: false,
				codeActions: false,
			});
			sourceMap.add({
				data: {
					vueTag: 'sfc',
					capabilities: {},
				},
				mode: SourceMaps.Mode.Overlap,
				sourceRange: {
					start: 0,
					end: 0,
				},
				mappedRange: {
					start: 0,
					end: docText.length,
				},
			});
			return sourceMap;
		}
	});
	return {
		textDocument,
		sourceMap,
	};
}
