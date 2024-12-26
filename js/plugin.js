const AdmZip = require('adm-zip');
const fs = require('fs');
const os = require('os');
const path = require('path');

const downloadsDir = path.join(os.homedir(), 'Downloads');
const outputDir = path.join(downloadsDir, 'UP-Export');

eagle.onPluginShow(async () => {
	let items = await eagle.item.get({ isSelected: true });
	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	} else if (fs.existsSync(outputDir) && fs.readdirSync(outputDir).length > 0) {
		const archiveDir = path.join(downloadsDir, 'UP-Archive');
		if (!fs.existsSync(archiveDir)) {
		  	fs.mkdirSync(archiveDir, { recursive: true });
		}
		const files = fs.readdirSync(outputDir);
		for (const file of files) {
		  	if (file !== 'archive') {
				const sourcePath = path.join(outputDir, file);
				const destinationPath = path.join(archiveDir, file);
				fs.renameSync(sourcePath, destinationPath);
		 	}
		}
		console.log('既存のファイルをarchiveフォルダに移動しました。');
	}
	items.forEach(item => {
		try {
			const zip = new AdmZip(item.filePath);
			const entries = zip.getEntries();
		
			const unityPackages = entries.filter(entry => {
			  	return path.extname(entry.entryName).toLowerCase() === '.unitypackage';
			});
		
			if (unityPackages.length === 0) {
			  	console.log('unitypackageファイルは見つかりませんでした。');
			 	return;
			}
		
			console.log('unitypackageファイルを展開中...');
			unityPackages.forEach(unityPackage => {
			  	const outputPath = path.join(outputDir, unityPackage.entryName);
			  	zip.extractEntryTo(unityPackage.entryName, outputDir, /* maintainEntryPath */ false, /* overwrite */ true);
			  	console.log(`- ${unityPackage.entryName} を ${outputPath} に展開しました`);
			});
		
			console.log('展開が完了しました。');
		  } catch (error) {
				console.error('エラーが発生しました:', error);
		  }
	});
	await eagle.window.hide();
});