use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, System, Transfer};

declare_id!("8eKmiTpTKYCkQiM1xLTkyqFD6f4Gf7a5kJzYbPDeJzEM");

#[program]
pub mod solana_agent_treasury {
    use super::*;

    pub fn create_team(ctx: Context<CreateTeam>, team_name: String) -> Result<()> {
        require!(!team_name.is_empty(), TreasuryError::InvalidTeamName);
        require!(team_name.len() <= 32, TreasuryError::InvalidTeamName);

        let t = &mut ctx.accounts.treasury;
        t.admin = ctx.accounts.admin.key();
        t.team_name = team_name;
        t.balance = 0;

        msg!("Treasury created: {}", t.team_name);
        Ok(())
    }

    pub fn deposit_funds(
        ctx: Context<DepositFunds>,
        _team_name: String,
        amount_lamports: u64,
    ) -> Result<()> {
        require!(amount_lamports > 0, TreasuryError::InvalidAmount);

        let cpi_accounts = Transfer {
            from: ctx.accounts.admin.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        };
        system_program::transfer(CpiContext::new(System::id(), cpi_accounts), amount_lamports)?;

        ctx.accounts.treasury.balance = ctx
            .accounts
            .treasury
            .balance
            .checked_add(amount_lamports)
            .ok_or(TreasuryError::Overflow)?;

        msg!("Deposited {} lamports", amount_lamports);
        Ok(())
    }

    pub fn execute_transfer(
        ctx: Context<ExecuteTransfer>,
        _team_name: String,
        amount_lamports: u64,
    ) -> Result<()> {
        require!(amount_lamports > 0, TreasuryError::InvalidAmount);
        require!(
            ctx.accounts.treasury.balance >= amount_lamports,
            TreasuryError::InsufficientFunds
        );

        let lamports = ctx.accounts.treasury.to_account_info().lamports();
        let rent_min =
            Rent::get()?.minimum_balance(ctx.accounts.treasury.to_account_info().data_len());
        require!(
            lamports.saturating_sub(rent_min) >= amount_lamports,
            TreasuryError::InsufficientFunds
        );

        **ctx.accounts.treasury.to_account_info().try_borrow_mut_lamports()? -= amount_lamports;
        **ctx.accounts.recipient.to_account_info().try_borrow_mut_lamports()? += amount_lamports;

        ctx.accounts.treasury.balance = ctx
            .accounts
            .treasury
            .balance
            .checked_sub(amount_lamports)
            .ok_or(TreasuryError::InsufficientFunds)?;

        msg!("Transferred {} lamports to {}", amount_lamports, ctx.accounts.recipient.key());
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(team_name: String)]
pub struct CreateTeam<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + TreasuryAccount::INIT_SPACE,
        seeds = [b"treasury", admin.key().as_ref(), team_name.as_bytes()],
        bump
    )]
    pub treasury: Account<'info, TreasuryAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(_team_name: String)]
pub struct DepositFunds<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"treasury", admin.key().as_ref(), _team_name.as_bytes()],
        bump,
        has_one = admin @ TreasuryError::Unauthorized,
    )]
    pub treasury: Account<'info, TreasuryAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(team_name: String)]
pub struct ExecuteTransfer<'info> {
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"treasury", admin.key().as_ref(), team_name.as_bytes()],
        bump,
        has_one = admin @ TreasuryError::Unauthorized,
    )]
    pub treasury: Account<'info, TreasuryAccount>,

    /// CHECK: recipient only receives lamports, no data validation needed
    #[account(mut)]
    pub recipient: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct TreasuryAccount {
    pub admin: Pubkey,
    #[max_len(32)]
    pub team_name: String,
    pub balance: u64,
}

#[error_code]
pub enum TreasuryError {
    #[msg("Only the admin can perform this action")]
    Unauthorized,
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Insufficient funds in treasury")]
    InsufficientFunds,
    #[msg("Team name must be 1-32 characters")]
    InvalidTeamName,
    #[msg("Arithmetic overflow")]
    Overflow,
}
