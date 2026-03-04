import hre from "hardhat";

async function main() {
    const ScrutinFactory = await hre.ethers.getContractFactory("ScrutinFactory");
    const factory = await ScrutinFactory.deploy();

    await factory.waitForDeployment();

    console.log(`ScrutinFactory deployed to: ${await factory.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
