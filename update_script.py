import pandas as pd

def update_csv(player_points_file, scorers_file, weekly_update_file):
    # Read the main CSV files
    player_points_df = pd.read_csv(player_points_file)
    scorers_df = pd.read_csv(scorers_file)
    weekly_update_df = pd.read_csv(weekly_update_file)

    # Extract the date from the weekly update
    update_date = weekly_update_df.columns[2]
    if update_date in player_points_df.columns:
        print(f"Date {update_date} already exists. Update aborted.")
        return

    # Update player points
    for index, row in weekly_update_df.iterrows():
        uid = row['UID']
        result = row[update_date]
        player_points_df.loc[player_points_df['UID'] == uid, update_date] = result

    # Update scorers
    for index, row in weekly_update_df.iterrows():
        uid = row['UID']
        goals = row['Goals']
        scorers_df.loc[scorers_df['UID'] == uid, update_date] = goals

    # Save the updated files
    player_points_df.to_csv(player_points_file, index=False)
    scorers_df.to_csv(scorers_file, index=False)
    print("CSV files updated successfully.")

# Example usage
update_csv('players points.csv', 'scorers.csv', 'weekly_update.csv')
