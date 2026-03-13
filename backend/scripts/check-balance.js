import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    const network = await hre.ethers.provider.getNetwork();

    console.log("--- DEBUG INFO ---");
    console.log("Network Name:", network.name);
    console.log("Chain ID:", network.chainId.toString());
    console.log("Deployer Address:", deployer.address);
    console.log("Deployer Balance:", hre.ethers.formatEther(balance), "ETH");
    console.log("------------------");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
