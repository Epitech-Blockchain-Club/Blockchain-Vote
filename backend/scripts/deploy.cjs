// CJS-compatible deploy script (used in "type: module" projects)
async function main() {
    const ScrutinFactory = await hre.ethers.getContractFactory("ScrutinFactory");
    const factory = await ScrutinFactory.deploy();
    await factory.waitForDeployment();
    const address = await factory.getAddress();
    console.log(`ScrutinFactory deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
