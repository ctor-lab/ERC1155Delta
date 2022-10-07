const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Greeter", function () {
    let accounts;
    let deployer;
    const data = '0x12345678';


    beforeEach(async function () {
        accounts = await ethers.getSigners();
        deployer = accounts[0];

        this.erc1155delta = await ethers.getContractFactory("ERC1155DeltaMock");
        this.erc1155delta = await this.erc1155delta.deploy('https://token-cdn-domain/{id}.json');
        await this.erc1155delta.deployed();
        

        this.wrapper = await  ethers.getContractFactory("ERC1155DeltaInERC721");
        this.wrapper = await this.wrapper.deploy(this.erc1155delta.address, "", "");
        await this.wrapper.deployed();
        
        this.converter = await  ethers.getContractFactory("TokenURIConversionMock");
        this.converter = await this.converter.deploy();
        await this.converter.deployed();

        await this.erc1155delta.connect(deployer).mint(deployer.address, 10, data);
    });
    
  it("Wrap and unwrap", async function () {
    await this.erc1155delta.connect(deployer).safeTransferFrom(
        deployer.address,
        this.wrapper.address,
        0, //tokenId
        1,
        data
    );

    expect(await this.wrapper.balanceOf(deployer.address)).to.be.equal("1");

    expect(await this.wrapper.ownerOf(0)).to.be.equal(deployer.address);
    expect(await this.erc1155delta.balanceOf(deployer.address, 3)).to.be.equal("1");

    await this.erc1155delta.connect(deployer).safeBatchTransferFrom(
        deployer.address,
        this.wrapper.address,
        [3,4], //tokenId
        [1,1],
        data
    );
    
    expect(await this.wrapper.balanceOf(deployer.address)).to.be.equal("3");

    expect(await this.wrapper.ownerOf(3)).to.be.equal(deployer.address);
    expect(await this.wrapper.ownerOf(4)).to.be.equal(deployer.address);

    expect(await this.erc1155delta.balanceOf(deployer.address, 3)).to.be.equal("0");


    await this.wrapper.connect(deployer).unwrap(
        [3]
    );
    expect(await this.erc1155delta.balanceOf(deployer.address, 3)).to.be.equal("1");
    expect(await this.wrapper.balanceOf(deployer.address)).to.be.equal("2");


  });

  it("URI conversion", async function () {

    // reference example: https://eips.ethereum.org/EIPS/eip-1155
    expect(await this.converter.convert(
        "https://token-cdn-domain/{id}.json",
        314592

    )).to.be.equal(
        "https://token-cdn-domain/000000000000000000000000000000000000000000000000000000000004cce0.json"
    );

    expect(await this.converter.convert(
        "https://token-cdn-domain/{id}",
        314592

    )).to.be.equal(
        "https://token-cdn-domain/000000000000000000000000000000000000000000000000000000000004cce0"
    );

    expect(await this.converter.convert(
        "{id}.json",
        314592

    )).to.be.equal(
        "000000000000000000000000000000000000000000000000000000000004cce0.json"
    );

   
  });
});
