use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    match core::str::from_utf8(instruction_data) {
        Ok(payload) => msg!("KACHING_ER_PROOF: {}", payload),
        Err(_) => msg!("KACHING_ER_PROOF_BYTES: {}", instruction_data.len()),
    }
    Ok(())
}
