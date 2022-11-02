// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();
  const deployer = accounts[0];
  const user1 = accounts[1];


  console.log("without gas refund");
  for(let i = 1; i <= 10; i++){
    let ERC721Psi = await hre.ethers.getContractFactory("ERC721PsiBurnableMock");
    ERC721Psi = await ERC721Psi.deploy("ERC721Psi", "ERC721Psi");
    ERC721Psi = await ERC721Psi.deployed();
    
    //console.log("ERC721Psi deployed to:", ERC721Psi.address);

    let ERC721A = await hre.ethers.getContractFactory("ERC721AMock");
    ERC721A = await ERC721A.deploy("ERC721A", "ERC721A");

    ERC721A = await ERC721A.deployed();

    //console.log("ERC721A deployed to:", ERC721A.address);

    let ERC1155Delta = await hre.ethers.getContractFactory("ERC1155DeltaMock");
    ERC1155Delta = await ERC1155Delta.deploy("");
    ERC1155Delta = await ERC1155Delta.deployed();
    
    
    await ERC721Psi['safeMint(address,uint256)'](deployer.address, 30);
    await ERC721A['safeMint(address,uint256)'](deployer.address, 30);
    await ERC1155Delta['mint(address,uint256)'](deployer.address, 30);

    // Burn one token to initialize some internal states, so the benchmark fits the real world scneraio better.
    await ERC721Psi['burn(uint256,uint256)'](0, 1);
    await ERC721A['burn(uint256,uint256)'](0, 1);
    await ERC1155Delta['burn(address,uint256,uint256)'](deployer.address, 0, 1);

    console.log(i);
    let erc721Psi_burn = await ERC721Psi['burn(uint256,uint256)'](1, i);
    console.log("ERC721Psi burn", (await erc721Psi_burn.wait()).gasUsed.toString());
    let erc721a_burn = await ERC721A['burn(uint256,uint256)'](1, i);
    console.log("ERC721A burn", (await erc721a_burn.wait()).gasUsed.toString());

    let ids = [];
    for (var j = 1; j <= i; j++) {
      ids.push(j);
    }
    let erc1155delta_burn = await ERC1155Delta['burnBatch(address,uint256[])'](deployer.address, ids);
    console.log("ERC1155Delta burn", (await erc1155delta_burn.wait()).gasUsed.toString());
  }


  console.log("with gas refund");
  for(let i = 1; i <= 10; i++){
    let ERC721Psi = await hre.ethers.getContractFactory("ERC721PsiBurnableMock");
    ERC721Psi = await ERC721Psi.deploy("ERC721Psi", "ERC721Psi");
    ERC721Psi = await ERC721Psi.deployed();
    
    //console.log("ERC721Psi deployed to:", ERC721Psi.address);

    let ERC721A = await hre.ethers.getContractFactory("ERC721AMock");
    ERC721A = await ERC721A.deploy("ERC721A", "ERC721A");

    ERC721A = await ERC721A.deployed();

    //console.log("ERC721A deployed to:", ERC721A.address);

    let ERC1155Delta = await hre.ethers.getContractFactory("ERC1155DeltaMock");
    ERC1155Delta = await ERC1155Delta.deploy("");
    ERC1155Delta = await ERC1155Delta.deployed();
    
    
    await ERC721Psi['safeMint(address,uint256)'](deployer.address, i+1);
    await ERC721A['safeMint(address,uint256)'](deployer.address, i+1);
    await ERC1155Delta['mint(address,uint256)'](deployer.address, i+1);

    // Burn one token to initialize some internal states, so the benchmark fits the real world scneraio better.
    await ERC721Psi['burn(uint256,uint256)'](0, 1);
    await ERC721A['burn(uint256,uint256)'](0, 1);
    await ERC1155Delta['burn(address,uint256,uint256)'](deployer.address, 0, 1);

    console.log(i);
    let erc721Psi_burn = await ERC721Psi['burn(uint256,uint256)'](1, i);
    console.log("ERC721Psi burn", (await erc721Psi_burn.wait()).gasUsed.toString());
    let erc721a_burn = await ERC721A['burn(uint256,uint256)'](1, i);
    console.log("ERC721A burn", (await erc721a_burn.wait()).gasUsed.toString());

    let ids = [];
    for (var j = 1; j <= i; j++) {
      ids.push(j);
    }
    let erc1155delta_burn = await ERC1155Delta['burnBatch(address,uint256[])'](deployer.address, ids);
    console.log("ERC1155Delta burn", (await erc1155delta_burn.wait()).gasUsed.toString());
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });