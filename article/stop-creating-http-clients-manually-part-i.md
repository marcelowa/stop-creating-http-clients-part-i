# Stop creating HTTP clients manually - Part I

> **TL;DR:**  
> Start generating your HTTP clients and all the DTOs of the requests and responses automatically from your API, using [openapi-generator](https://github.com/OpenAPITools/openapi-generator) instead of writing your own.

In this post I'll introduce you to an amazing tool that can generate HTTP clients for you. 
Why is this part 1? Because there are many other topics that can be covered later on to complement his introduction, such as:
- A frontend app/backend service example that uses this generated client;
- How to publish this generated client as an NPM package;
- Example of a CI/CD pipeline that automatically generates and publishes this client every time the API server changes as an NPM package;
- Clients in other languages/platforms that can be generated using openapi-generator, and how to use them. 

## Why should I avoid writing my own HTTP client?
- Writing an HTTP client is a repetitive task. Your HTTP clients will look similar at best, and very different from each other at worst.
- If an organization uses multiple programming languages/platforms that consume the same HTTP API the same HTTP client would be implemented multiple times for each of these different platforms. 
- Also, it's worth mentioning that writing your own HTTP client is a task prone to errors and typos; It’s very easy to miss or make mistakes on required headers, query parameters etc. 
- Server changes would require updating all of the HTTP clients and their consumers. 
- Last but not least, when using DTOs after the server modeled the requests and responses, each client will need to model them again. This process takes some experimentation to get it right, properties that are optional or required, types, enums, etc…

## What will I get if I generate this HTTP client?
- A standard client across every project that can practically be generated for most popular programming languages/platforms/frameworks. 
- The generated client already includes and exposes all relevant DTOs. 
- This client can be automatically generated on a CI/CD pipeline every time the server changes and then be published as a package on the relevant package registry/manager (NPM, Maven etc…). 
- The engineers that consume your API will love you even more.

## Concerns:
- Breaking changes on the server such as changing an existing API signature (URL, DTO's etc…) will be reflected automatically on the generated client, which in turn will affect the consuming apps/services. 
- Even if the client is generated automatically and published as a package, the consumers are probably not using this version yet, and will require an update. 
- The client generated from the openapi-generator tool may not always fit the specific use case and needs of every team.  
- openapi-generator updates might break compatibility. Therefore, you must be very careful every time you generate a new version of the same client after openapi-generator gets updated.

---

## The practical part
WOW!! You read this far, and finally reached the exciting part, where I show you an example of how to generate a Typescript HTTP client, and also demonstrate how to use it.

> **Notice:**  
> I am working on MacOS with Homebrew and Node.js installed, so all the commands I'll show you are for MacOS, but you can easily find the equivalent commands for your OS. 

To start using the openapi-generator you'll need to install it. I just followed the instructions for Homebrew (https://openapi-generator.tech/docs/installation):
```shell
brew install openapi-generator
```

Now given an OpenAPI spec like this one: https://petstore3.swagger.io/api/v3/openapi.json I ran the following command on my terminal
```shell
openapi-generator generate \
	-i "https://petstore3.swagger.io/api/v3/openapi.json" \
	-g typescript-fetch \
	-o ./src/petstore3 \
	--additional-properties=npmVersion=1.0.0,supportsES6=true,useSingleRequestParameter=false,modelPropertyNaming=original,npmName=@marcelowa/petstore3
```

It takes some time to figure out all the options and how to use them and requires reading the documentation and experimenting. Here is the documentation for the typescript-fetch client: https://openapi-generator.tech/docs/generators/typescript-fetch and to the openapi-generator generate command in general: https://openapi-generator.tech/docs/usage/#generate

I’ll briefly explain the command I used:
- `openapi-generator generate` the basic command
- `-i "https://petstore3.swagger.io/api/v3/openapi.json"` where to take the OpenApi json file
- `-g typescript-fetch` the client I would like to generate, openapi-generator supports so many clients, just go to the documentation and read about all the options
- `-o ./src/petstore3` where to output the files
- `- additional-properties=…` additional properties specific to this "typescript-fetch" client, will affect the resulting client  

Running this command resulted with the following files:
```
.gitignore
.npmignore
.openapi-generator-ignore
README.md
package.json
src/apis/PetApi.ts
src/apis/StoreApi.ts
src/apis/UserApi.ts
src/apis/index.ts
src/index.ts
src/models/Address.ts
src/models/Category.ts
src/models/Customer.ts
src/models/ModelApiResponse.ts
src/models/Order.ts
src/models/Pet.ts
src/models/Tag.ts
src/models/User.ts
src/models/index.ts
src/runtime.ts
tsconfig.esm.json
tsconfig.json
```

Without looking at the content of the files, and just by looking at the folder and the filenames you can assume the role of each file. Looking at the "src/models" folder files is mindblowing - we just automatically generated all the DTO's.I believe you would agree with me this is totally awesome, let's just look at the "Pet" interface inside "src/models/Pet.ts" file:
```TypeScript
/**
 *
 * @export
 * @interface Pet
 */
export interface Pet {
	/**
 	*
 	* @type {number}
 	* @memberof Pet
 	*/
	id?: number;
	/**
 	*
 	* @type {string}
 	* @memberof Pet
 	*/
	name: string;
	/**
 	*
 	* @type {Category}
 	* @memberof Pet
 	*/
	category?: Category;
	/**
 	*
 	* @type {Array<string>}
 	* @memberof Pet
 	*/
	photoUrls: Array<string>;
	/**
 	*
 	* @type {Array<Tag>}
 	* @memberof Pet
 	*/
	tags?: Array<Tag>;
	/**
 	* pet status in the store
 	* @type {string}
 	* @memberof Pet
 	*/
	status?: PetStatusEnum;
}
```
This is just a small example, which enables you to get a feel for how it looks. 

Now let me go ahead and show you how to use this generated client:

> **Notice:**  
> In my openapi-generate command example I included this `-o ./src/petstore3` option, the `-o` is the output flag which specifies where to put the generated files so my `usage-example.ts` can use a relative import to import the generated client (I know, there are more elegant ways to make this client available to my code, but for the purpose of this tutorial this is good enough). 

Inside the `src` folder I'll manually create this file:
```TypeScript
// src/usage-exmaple.ts
import { Configuration, FindPetsByStatusStatusEnum, PetApi } from './petstore3/src';

const usageExample = async () => {
  const config = new Configuration({
	basePath: 'https://petstore3.swagger.io/api/v3',
  });

  const petApi = new PetApi(config);
  const pets = await petApi.findPetsByStatus(FindPetsByStatusStatusEnum.Available);
  console.log(pets);
};
usageExample();
```


Let me explain this small example:
- the import line imports the `PetApi` client and some DTO's such as `Configuration` and `FindPetsByStatusStatusEnum`
- on the `usageExample` function I created an `petApi` instance of `PetApi` configured using `basePath`
- I then Call the `petApi.findPetsByStatus` method with the `Available` status (from FindPetsByStatusStatusEnum), which actually calls `/pet/findByStatus` endpoint on the petstore3 API

## Summary
In this part we covered:
- Some of the reasons and benefits of automatically generating a client using the openapi-generator tool and also discussed some of the concerns. 
- Generated a `typescript-fetch` client using openapi-generator
- Reviewed a small example showing how to use this generated client and how powerful it is. 

I really hope you enjoyed reading this post and found it useful.
You can find all the snippets, code examples and generated code in the following repository:  
https://github.com/marcelowa/stop-creating-http-clients-part-i
- `src/petstore3` folder contains the generated client and DTO's
- `src/usage-example.ts` contains the example of how to use it.
- `README.md` contains the instructions on how to run the example.

Feel free to comment, ask questions and share your thoughts. If you find any mistakes please let me know and I'll be happy to fix them.  
Stay tuned for the next parts, where I'll cover more topics related to this subject. 

## Resources
- https://openapi-generator.tech the official openapi-generator website
- https://github.com/OpenAPITools/openapi-generator the openapi-generator github repository
- https://github.com/marcelowa/stop-creating-http-clients-part-i the repository with all the code and snippets from this post