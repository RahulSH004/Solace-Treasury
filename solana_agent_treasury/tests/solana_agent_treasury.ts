
import * as anchor from "@anchor-lang/core";
import { Program } from "@anchor-lang/core";
import { SolanaAgentTreasury } from "../target/types/solana_agent_treasury";

describe("solana_agent_treasury", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SolanaAgentTreasury as Program<SolanaAgentTreasury>;
  const admin = provider.wallet;

  it("creates a team", async () => {
    const teamName = "Test Team";

    await program.methods
      .createTeam(teamName)
      .rpc();

    const [treasuryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), admin.publicKey.toBuffer(), Buffer.from(teamName)],
      program.programId
    );

    const treasury = await program.account.treasuryAccount.fetch(treasuryPda);
    console.log("admin:", treasury.admin.toString());
    console.log("team name:", treasury.teamName);
    console.log("balance:", treasury.balance.toString());
  });

  it("deposits funds", async () => {
    const teamName = "Test Team";

    await program.methods
      .depositFunds(teamName, new anchor.BN(500_000_000))
      .rpc();

    const [treasuryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), admin.publicKey.toBuffer(), Buffer.from(teamName)],
      program.programId
    );

    const treasury = await program.account.treasuryAccount.fetch(treasuryPda);
    console.log("✓ balance after deposit:", treasury.balance.toString());
  });

  it("executes a transfer", async () => {
    const teamName = "Test Team";
    const recipient = anchor.web3.Keypair.generate();

    const [treasuryPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("treasury"), admin.publicKey.toBuffer(), Buffer.from(teamName)],
      program.programId
    );

    await program.methods
      .executeTransfer(teamName, new anchor.BN(100_000_000))
      .accounts({ recipient: recipient.publicKey })
      .rpc();

    const treasury = await program.account.treasuryAccount.fetch(treasuryPda);
    console.log("✓ balance after transfer:", treasury.balance.toString());
  });
});
