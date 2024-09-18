const { readFile, readdir } = require('fs/promises');
const exists = require('fs').existsSync;

const tryLoading = (file, silent) => new Promise(async (res, rej) => {
	if (!exists(file) && !silent) return rej('the file does not exist');

	const rawFile = await readFile(file);
	try { res(JSON.parse(rawFile)); }
	catch (e) { if (!silent) rej(`failed to parse file`); }
})

module.exports = async () => {
	// load up globals
	const globalConfig = await tryLoading('config/global.json').catch(e => {
		console.log(`[config.js] failed to load global config (reason: ${e}), the bot cannot proceed!`);
		process.exit(1);
	});

	// look for categories
	const categories = await readdir('config/categories');
	if (categories.length == 0) console.warn('[config.js] could not find any categories to load!')

	// load up categories
	globalConfig.categories = {};
	for (const cat of categories) {
		// load up the basic config
		const category = await tryLoading(`config/categories/${cat}/config.json`).catch(e => console.log(`[config.js] failed to load config for category "${cat}" (reason: ${e})`));
		if (!category) continue;

		// load up the extra things
		for (const thing of ['welcomer', 'modal', 'fields']) category[thing] = await tryLoading(`config/categories/${cat}/${thing}.json`, true);

		// give modals proper custom ids
		if (category.modal) category.modal.custom_id = `modal_${cat}`;

		globalConfig.categories[cat] = category;
	}

	// look for panels
	const panels = (await readdir('config/panels')).map(p => p.split('.').slice(0, -1).join('.'));
	if (panels.length == 0) console.warn('[config.js] could not find any panels to load!')

	// load up panels
	globalConfig.panels = {};
	for (const pan of panels) globalConfig.panels[pan] = await tryLoading(`config/panels/${pan}.json`).catch(e => console.log(`[config.js] failed to load config for panel "${pan}" (reason: ${e})`));

	global.config = globalConfig;
	console.log('[config.js] loaded all configurations!');
}