var fs = require('fs');
var inquirer = require('inquirer');
var servicedMetadata;
var supportedServices;
var cfnFilename;

function serviceWalkthrough(service) {
	let inputs = servicedMetadata[service].inputs;
	let questions = [];
	for(let i = 0; i < inputs.length; i++) {
		// Can have a cool question builder function here based on input json - will iterate on this
		// Can also have some validations here based on the input json
		//Uncool implementation here 
		if(inputs[i].options) {
			let question = {
				name: inputs[i].key,
				message: inputs[i].question,
				type: 'list',
				choices: inputs[i].options
			};
			questions.push(question);
		} else {
			let question = {
				name: inputs[i].key,
				message: inputs[i].question,
				type: 'input'
			};
			questions.push(question);
		}
	}

	return inquirer.prompt(questions);
}


function copyCfnTemplate(context, category, options) {
	const {awsmobile} = context;
	let targetDir = awsmobile.pathManager.getBackendDirPath();
	let pluginDir = __dirname;

	const copyJobs = [
		{
			dir: pluginDir, 
			template: 'cloudformation-templates/' + cfnFilename, 
			target: targetDir + '/' + category + '/' + options.resourceName + '/' +  options.resourceName + '-' + 'cloudformation-template.yml'
		}
	];

	// copy over the files
  	return context.awsmobile.copyBatch(context, copyJobs, options);
}

function addResource(context, category, service) {
	let answers;
	servicedMetadata = JSON.parse(fs.readFileSync(__dirname + '/supported-services.json'))[category];
	supportedServices = Object.keys(servicedMetadata);
	cfnFilename = servicedMetadata[service].cfnFilename;
	return serviceWalkthrough(service)
		.then((result) => {
			answers = result;
			copyCfnTemplate(context, category, answers)
		})
		.then(() => {
			return answers.resourceName
		});
}

module.exports = {addResource}; 