const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Scrutin & VoteSession", function () {
    let factory;
    let owner;
    let mod1;
    let voter1;

    beforeEach(async function () {
        [owner, mod1, voter1] = await ethers.getSigners();
        const ScrutinFactory = await ethers.getContractFactory("ScrutinFactory");
        factory = await ScrutinFactory.deploy();
    });

    it("Should create a scrutin and add a session", async function () {
        const tx = await factory.createScrutin(
            "Election 2026",
            "Test",
            "National",
            "France",
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000) + 3600
        );
        const receipt = await tx.wait();

        // In Hardhat/ethers v6, events are in receipt.logs
        const addresses = await factory.getDeployedScrutins();
        expect(addresses.length).to.equal(1);

        const scrutinAddr = addresses[0];
        const Scrutin = await ethers.getContractAt("Scrutin", scrutinAddr);

        await Scrutin.addVoteSession("Session 1", "Desc", 100, [mod1.address]);
        const sessions = await Scrutin.getSessions();
        expect(sessions.length).to.equal(1);

        const sessionAddr = sessions[0];
        const VoteSession = await ethers.getContractAt("VoteSession", sessionAddr);
        expect(await VoteSession.title()).to.equal("Session 1");
    });

    it("Should allow voting and tallies", async function () {
        // 1. Create scrutin
        await factory.createScrutin("V", "D", "S", "C", 0, 9999999999);
        const addr = (await factory.getDeployedScrutins())[0];
        const scrutin = await ethers.getContractAt("Scrutin", addr);

        // 2. Add session with options
        await scrutin.addVoteSession("S1", "D1", 10, [mod1.address]);
        const sAddr = (await scrutin.getSessions())[0];
        const session = await ethers.getContractAt("VoteSession", sAddr);

        await session.addOption("Option A", "HashA", "LogoA");
        await session.addOption("Option B", "HashB", "LogoB");

        // 3. Vote
        const voterHash = ethers.keccak256(ethers.toUtf8Bytes("voter1@test.com"));
        await session.castVote(voterHash, 0);

        const results = await session.getResults();
        expect(results[0].voteCount).to.equal(1n);
        expect(results[1].voteCount).to.equal(0n);
    });
});
